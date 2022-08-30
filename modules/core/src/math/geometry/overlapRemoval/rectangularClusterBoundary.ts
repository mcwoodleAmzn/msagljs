//  Clusters can (optionally) have a rectangular border which is respected by overlap avoidance.
//  Currently, this is controlled by FastIncrementalLayoutSettings.RectangularClusters.
//  If FastIncrementalLayoutSettings.RectangularClusters is true, then the
//  FastIncrementalLayout constructor will create a RectangularBoundary in each cluster.
//  Otherwise it will be null.

import {CurveFactory} from '..'
import {ICurve} from '../icurve'
import {Point} from '../point'
import {Rectangle} from '../rectangle'
import {BorderInfo} from './borderInfo'
import {OverlapRemovalCluster} from './overlapRemovalCluster'
type Margin = {
  Left: number

  Right: number

  Top: number

  Bottom: number
}

export class RectangularClusterBoundary {
  //  Set margins to zero which also initializes other members.

  public constructor() {
    this.LeftBorderInfo = BorderInfo.constructorN(0)
    this.RightBorderInfo = BorderInfo.constructorN(0)
    this.TopBorderInfo = BorderInfo.constructorN(0)
    this.BottomBorderInfo = BorderInfo.constructorN(0)
  }

  rectangle: Rectangle = new Rectangle({left: 0, right: 0, top: 0, bottom: 0})

  //  Used only for RectangularHull
  olapCluster: OverlapRemovalCluster

  //  For use with RectangularHull only, and only valid during verletIntegration()

  //  Left margin of this cluster (additional space inside the cluster border).

  public get LeftMargin(): number {
    return this.LeftBorderInfo.InnerMargin
  }
  public set LeftMargin(value: number) {
    this.LeftBorderInfo = new BorderInfo(value, this.LeftBorderInfo.FixedPosition, this.LeftBorderInfo.Weight)
  }

  //  Right margin of this cluster (additional space inside the cluster border).

  public get RightMargin(): number {
    return this.RightBorderInfo.InnerMargin
  }
  public set RightMargin(value: number) {
    this.RightBorderInfo = new BorderInfo(value, this.RightBorderInfo.FixedPosition, this.RightBorderInfo.Weight)
  }

  //  Top margin of this cluster (additional space inside the cluster border).

  public get TopMargin(): number {
    return this.TopBorderInfo.InnerMargin
  }
  public set TopMargin(value: number) {
    this.TopBorderInfo = new BorderInfo(value, this.TopBorderInfo.FixedPosition, this.TopBorderInfo.Weight)
  }

  //  Bottom margin of this cluster (additional space inside the cluster border).

  public get BottomMargin(): number {
    return this.BottomBorderInfo.InnerMargin
  }
  public set BottomMargin(value: number) {
    this.BottomBorderInfo = new BorderInfo(value, this.BottomBorderInfo.FixedPosition, this.BottomBorderInfo.Weight)
  }

  //  Information for the Left border of the cluster.

  LeftBorderInfo: BorderInfo

  //  Information for the Right border of the cluster.

  RightBorderInfo: BorderInfo

  //  Information for the Top border of the cluster.

  TopBorderInfo: BorderInfo

  //  Information for the Bottom border of the cluster.

  BottomBorderInfo: BorderInfo

  //  When this is set, the OverlapRemovalCluster will generate equality constraints rather than inequalities
  //  to keep its children within its bounds.

  GenerateFixedConstraints = false

  generateFixedConstraintsDefault = false

  //  The default value that GenerateFixedConstraints will be reverted to when a lock is released

  public get GenerateFixedConstraintsDefault(): boolean {
    return this.generateFixedConstraintsDefault
  }
  public set GenerateFixedConstraintsDefault(value: boolean) {
    this.generateFixedConstraintsDefault = value
    this.GenerateFixedConstraints = value
  }

  //  The rectangular hull of all the points of all the nodes in the cluster, as set by
  //  ProjectionSolver.Solve().
  //  Note: This rectangle may not originate at the barycenter.  Drawing uses only the results
  //  of this function; the barycenter is used only for gravity computations.

  //  <returns></returns>
  public RectangularHull(): ICurve {
    // Debug.Assert((this.rectangle.Bottom <= this.rectangle.Top));
    if (this.RadiusX > 0 || this.RadiusY > 0) {
      return CurveFactory.mkRectangleWithRoundedCorners(
        this.rectangle.width,
        this.rectangle.height,
        this.RadiusX,
        this.RadiusY,
        this.rectangle.center,
      )
    } else {
      return CurveFactory.createRectangle(this.rectangle.width, this.rectangle.height, this.rectangle.center)
    }
  }

  //  Will only return something useful if FastIncrementalLayoutSettings.AvoidOverlaps is true.

  public get Rect(): Rectangle {
    return this.rectangle
  }
  public set Rect(value: Rectangle) {
    this.rectangle = value
  }

  defaultMargin: Margin

  get DefaultMarginIsSet(): boolean {
    return this.defaultMargin != null
  }

  //  The default margin stored by StoreDefaultMargin

  public get DefaultLeftMargin(): number {
    return this.defaultMargin.Left
  }

  //  The default margin stored by StoreDefaultMargin

  public get DefaultTopMargin(): number {
    return this.defaultMargin.Top
  }

  //  The default margin stored by StoreDefaultMargin

  public get DefaultRightMargin(): number {
    return this.defaultMargin.Right
  }

  //  The default margin stored by StoreDefaultMargin

  public get DefaultBottomMargin(): number {
    return this.defaultMargin.Bottom
  }

  //  store a the current margin as the default which we can revert to later with the RestoreDefaultMargin

  public StoreDefaultMargin() {
    this.defaultMargin = {
      Left: this.LeftMargin,
      Right: this.RightMargin,
      Bottom: this.BottomMargin,
      Top: this.TopMargin,
    }
  }

  //  store a default margin which we can revert to later with the RestoreDefaultMargin

  public StoreDefaultMarginNNNN(left: number, right: number, bottom: number, top: number) {
    this.defaultMargin = {
      Left: left,
      Right: right,
      Bottom: bottom,
      Top: top,
    }
  }

  //  revert to a previously stored default margin

  public RestoreDefaultMargin() {
    if (this.defaultMargin != null) {
      this.LeftMargin = this.defaultMargin.Left
      this.RightMargin = this.defaultMargin.Right
      this.TopMargin = this.defaultMargin.Top
      this.BottomMargin = this.defaultMargin.Bottom
    }
  }

  //  Move the bounding box by delta

  public TranslateRectangle(delta: Point) {
    this.rectangle.center = this.rectangle.center.add(delta)
  }

  //  Radius on the X axis

  RadiusX: number

  //  Radius on the Y axis

  RadiusY: number

  //  Creates a lock on all four borders

  public Lock(left: number, right: number, top: number, bottom: number) {
    const weight = 10000
    this.LeftBorderInfo = new BorderInfo(this.LeftBorderInfo.InnerMargin, left, weight)
    this.RightBorderInfo = new BorderInfo(this.RightBorderInfo.InnerMargin, right, weight)
    this.TopBorderInfo = new BorderInfo(this.TopBorderInfo.InnerMargin, top, weight)
    this.BottomBorderInfo = new BorderInfo(this.BottomBorderInfo.InnerMargin, bottom, weight)
  }

  //  Releases the lock on all four borders

  public Unlock() {
    this.LeftBorderInfo = BorderInfo.constructorN(this.LeftBorderInfo.InnerMargin)
    this.RightBorderInfo = BorderInfo.constructorN(this.RightBorderInfo.InnerMargin)
    this.TopBorderInfo = BorderInfo.constructorN(this.TopBorderInfo.InnerMargin)
    this.BottomBorderInfo = BorderInfo.constructorN(this.BottomBorderInfo.InnerMargin)
  }

  //  boundary can shrink no more than this

  MinWidth: number

  //  boundary can shrink no more than this

  MinHeight: number
}
