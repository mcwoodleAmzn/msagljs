import {Layer, project32, Position, Color, UNIT, Unit, Accessor, LayerProps, UpdateParameters, DefaultProps} from '@deck.gl/core/typed'
import GL from '@luma.gl/constants'
import {Model, Geometry} from '@luma.gl/engine'
import {Texture2D} from '@luma.gl/webgl'
import {picking} from '@luma.gl/shadertools'

import {nodeDepthModuleVs} from './graph-highlighter'

// TODO - Use ShapeEnum from @msagl/core
export enum SHAPE {
  Rectangle = 0,
  Oval = 1,
  Diamond = 2,
}

export type GeometryLayerProps<DataT = any> = {
  lineWidthUnits?: Unit
  lineWidthScale?: number
  lineWidthMinPixels?: number
  lineWidthMaxPixels?: number

  sizeScale?: number

  stroked?: boolean
  filled?: boolean

  /** Only applies to SHAPE.Rectangle */
  cornerRadius?: number

  nodeDepth?: Texture2D
  highlightColors?: number[][]

  getPickingColor?: Accessor<DataT, Color>
  getPosition?: Accessor<DataT, Position>
  getSize?: Accessor<DataT, [number, number]>
  getFillColor?: Accessor<DataT, Color>
  getLineColor?: Accessor<DataT, Color>
  getLineWidth?: Accessor<DataT, number>
  getShape?: Accessor<DataT, SHAPE>
} & LayerProps<DataT>

const defaultProps: DefaultProps<GeometryLayerProps> = {
  lineWidthUnits: 'common',
  lineWidthScale: {type: 'number', min: 0, value: 1},
  lineWidthMinPixels: {type: 'number', min: 0, value: 0},
  lineWidthMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  sizeScale: {type: 'number', min: 0, value: 1},

  stroked: true,
  filled: true,

  cornerRadius: {type: 'number', min: 0, value: 0},
  highlightColors: {
    type: 'array',
    compare: true,
    value: [
      [255, 100, 0],
      [255, 200, 80],
      [255, 255, 200],
    ],
  },

  getPickingColor: {type: 'accessor', value: [0, 0, 0]},
  getPosition: {type: 'accessor', value: (x: any) => x.position},
  getSize: {type: 'accessor', value: (x: any) => x.size},
  getFillColor: {type: 'accessor', value: [255, 255, 255, 255]},
  getLineColor: {type: 'accessor', value: [0, 0, 0, 255]},
  getLineWidth: {type: 'accessor', value: 1},
  getShape: {type: 'accessor', value: SHAPE.Rectangle},
}

const vs = `\
#define SHADER_NAME geometry-layer-vertex-shader
attribute vec2 positions;
attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec2 instanceSizes;
attribute float instanceShapes;
attribute float instanceLineWidths;
attribute vec4 instanceFillColors;
attribute vec4 instanceLineColors;
attribute vec3 instancePickingColors;

uniform mat4 depthHighlightColors;
uniform float opacity;
uniform float sizeScale;
uniform float lineWidthScale;
uniform float lineWidthMinPixels;
uniform float lineWidthMaxPixels;
uniform bool stroked;
uniform bool filled;
uniform int lineWidthUnits;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 vPosition;
varying vec4 shape; // [width, height, lineWidth, SHAPE]

${nodeDepthModuleVs}

void applyHighlight(int i) {
  if (i >= 3) return;
  vFillColor.rgb = mix(vFillColor.rgb, depthHighlightColors[i].rgb, depthHighlightColors[i].a);
}

void main(void) {
  geometry.worldPosition = instancePositions;

  // Multiply out line width and clamp to limits
  float lineWidthPixels = clamp(
    project_size_to_pixel(lineWidthScale * instanceLineWidths, lineWidthUnits),
    lineWidthMinPixels, lineWidthMaxPixels
  );
  float lineWidthCommon = project_pixel_size(lineWidthPixels);

  geometry.uv = positions.xy;

  vec3 offset = vec3((instanceSizes * sizeScale + 1.0) / 2.0 * positions.xy, 0.0);
  DECKGL_FILTER_SIZE(offset, geometry);
  
  vPosition = offset.xy;
  shape = vec4(instanceSizes * sizeScale, lineWidthCommon, instanceShapes);

  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);

  picking_setPickingColor(instancePickingColors);

  float depth;
  if (getDepth(instancePickingColors, depth)) {
    applyHighlight(int(depth));
  }
}
`

const fs = `\
#define SHADER_NAME geometry-layer-fragment-shader
#define RECTANGLE 0.0
#define OVAL      1.0
#define DIAMOND   2.0

#define SIN_60 0.8660254

precision highp float;

uniform bool filled;
uniform bool stroked;
uniform float cornerRadius;
uniform float project_uScale;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 vPosition;
varying vec4 shape; // [width, height, lineWidth, SHAPE]

float smoothedgeCommon(float edge, float x) {
  float radius = 0.5 / project_uScale;
  return smoothstep(edge - radius, edge + radius, x);
}

float smoothedgeCommon(float edge, float x, float maxRadius) {
  float radius = min(0.5 / project_uScale, maxRadius);
  return smoothstep(edge - radius, edge + radius, x);
}

float inRectangle(vec2 halfSize, float radius) {
  vec2 edgeVec = halfSize - abs(vPosition);
  float edgeDistance = min(edgeVec.x, edgeVec.y);
  float inside = smoothedgeCommon(0.0, edgeDistance);
  if (radius == 0.0) {
    return inside;
  }
  vec2 cornerVec = radius - edgeVec;
  cornerVec *= float(cornerVec.x > 0.0 && cornerVec.y > 0.0);
  float outCorner = smoothedgeCommon(radius, length(cornerVec), radius / 2.0);
  return inside * (1.0 - outCorner);
}

float inOval(vec2 halfSize) {
  float aspect = halfSize.x / halfSize.y;
  return smoothedgeCommon(length(vec2(vPosition.x, vPosition.y * aspect)), halfSize.x);
}

float inDiamond(vec2 halfSize) {
  float aspect = halfSize.x / halfSize.y;
  vec2 edgeVec = abs(vPosition);
  return smoothedgeCommon(edgeVec.x, halfSize.x - edgeVec.y * aspect);
}

void main(void) {
  float inShape;
  float inFill;
  float lineWidth = shape.z;
  float type = shape.w;
  vec2 halfSize = shape.xy / 2.0;

  if (type == RECTANGLE)
  {
    inShape = inRectangle(halfSize, cornerRadius);
    inFill = inRectangle(halfSize - lineWidth, max(cornerRadius - lineWidth, 0.0));
  }
  else if (type == OVAL)
  {
    inShape = inOval(halfSize);
    inFill = inOval(halfSize - lineWidth);
  }
  else if (type == DIAMOND)
  {
    inShape = inDiamond(halfSize);
    float c = length(halfSize);
    float cscA = c / halfSize.y;
    float secA = c / halfSize.x;
    inFill = inDiamond(halfSize - lineWidth * vec2(cscA, secA));
  }

  if (inShape == 0.0) {
    discard;
  }
  if (picking_uActive) {
    gl_FragColor = picking_filterPickingColor(vFillColor);
    return;
  }

  if (stroked) {
    if (filled) {
      gl_FragColor = mix(vLineColor, vFillColor, inFill);
    } else {
      if (inFill == 1.0) {
        discard;
      }
      gl_FragColor = vec4(vLineColor.rgb, vLineColor.a * (1.0 - inFill));
    }
  } else if (filled) {
    gl_FragColor = vFillColor;
  } else {
    discard;
  }

  gl_FragColor.a *= inShape;
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`

export default class GeometryLayer<DataT> extends Layer<Required<GeometryLayerProps<DataT>>> {
  static defaultProps = defaultProps
  static layerName = 'GeometryLayer'

  state!: {
    model?: Model
  }

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]})
  }

  initializeState() {
    this.getAttributeManager().addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: true,
        transition: true,
        accessor: 'getPosition',
      },
      instanceSizes: {
        size: 2,
        transition: true,
        accessor: 'getSize',
      },
      instanceFillColors: {
        size: 4,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getFillColor',
        defaultValue: [0, 0, 0, 255],
      },
      instanceLineColors: {
        size: 4,
        transition: true,
        normalized: true,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getLineColor',
        defaultValue: [0, 0, 0, 255],
      },
      instanceLineWidths: {
        size: 1,
        transition: true,
        accessor: 'getLineWidth',
        defaultValue: 1,
      },
      instanceShapes: {
        size: 1,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getShape',
      },
      instancePickingColors: {
        size: 3,
        type: GL.UNSIGNED_BYTE,
        accessor: 'getPickingColor',
      },
    })
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params)

    const {props, oldProps, changeFlags} = params
    let modelChanged = false

    if (changeFlags.extensionsChanged) {
      const {gl} = this.context
      this.state.model?.delete()
      this.state.model = this._getModel(gl)
      this.getAttributeManager().invalidateAll()
      modelChanged = true
    }

    if (modelChanged || props.highlightColors !== oldProps.highlightColors) {
      const depthHighlightColors = new Float32Array(16)
      for (let i = 0; i < 4; i++) {
        const color = props.highlightColors[i]
        if (color) {
          depthHighlightColors[i * 4] = color[0] / 255
          depthHighlightColors[i * 4 + 1] = color[1] / 255
          depthHighlightColors[i * 4 + 2] = color[2] / 255
          depthHighlightColors[i * 4 + 3] = Number.isFinite(color[3]) ? color[3] / 255 : 1
        }
      }
      this.state.model.setUniforms({depthHighlightColors})
    }
  }

  draw({uniforms}: any) {
    const {stroked, filled, cornerRadius, sizeScale, lineWidthUnits, lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels, nodeDepth} =
      this.props

    this.state.model
      .setUniforms(uniforms)
      .setUniforms({
        stroked,
        filled,
        cornerRadius,
        sizeScale,
        lineWidthUnits: UNIT[lineWidthUnits],
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels,
        nodeDepth,
        textureDim: [nodeDepth.width, nodeDepth.height],
      })
      .draw()
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
    // a square that minimally cover the unit circle
    const positions = [-1, -1, 1, -1, 1, 1, -1, 1]

    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertexCount: 4,
        attributes: {
          positions: {size: 2, value: new Float32Array(positions)},
        },
      }),
      isInstanced: true,
    })
  }
}
