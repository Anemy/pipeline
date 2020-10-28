import React, { Component } from 'react';
import { connect } from 'react-redux';
import L from 'leaflet';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { debounce } from 'lodash';

import './coordinates-minichart.css';

import GeoscatterMapItem from './marker';
import { DEFAULT_TILE_URL } from './constants';
import { InnerFieldType } from '../../../models/field-type';
import {
  ActionTypes,
  UpdateStoreAction
} from '../../../store/actions';
import {
  AppState
} from '../../../store/store';
import Stage, {
  ensureWeAreOnValidStageForAction, FilterStage, STAGES
} from '../../../models/stage';
import { getHereAttributionMessage } from './utils';
import { addLayer, isLayerWeCanAdd, generateGeoQuery } from '../../../modules/geo';

// TODO: Disable boxZoom handler for circle lasso.
//
// const SELECTED_COLOR = '#F68A1E';
const UNSELECTED_COLOR = '#43B1E5';
// const CONTROL_COLOR = '#ed271c';

/**
 * Fetches the tiles from the compass maps-proxy
 * and attaches the attribution message to the
 * map.
 * @param {react-leaflet.Map} map The rendered component ref.
 */
const attachAttribution = async function (map: any) {
  let attributionMessage = '';
  if (map) {
    const bounds = map.leafletElement.getBounds();
    const level = map.leafletElement.getZoom();

    attributionMessage = await getHereAttributionMessage(bounds, level);
  }
  return attributionMessage;
};

/**
 * @example
 * var doc = {
 *   _id: ObjectId('5c8c1f86db2e914acc6e8a17'),
 *   'Start Time': '',
 *   'End Time': null,
 *   Name: null,
 *   Latitude: null,
 *   Longitude: null,
 *   Service: null,
 *   Coordinates: [NaN, NaN]
 * };
 * isValidLatLng(doc.Coordinates) // [NaN, NaN];
 * > false
 * @param {Array<Double>} value
 * @returns {Boolean}
 */
const isValidLatLng = (value: any) => {
  if (isNaN(+value[0]) || isNaN(+value[1])) {
    // eslint-disable-next-line no-console
    console.warn('@mongodb-js/compass-schema:coordinates-minichart: Dropping invalid coordinate value', value);
    return false;
  }

  return true;
};

/**
 * Transforms an array `[lat,long]` coordinates into a GeoJSON Point.
 * @param {Array} value `[long, lat]`
 * @returns {Object}
 */
const valueToGeoPoint = (value: any) => {
  const [lat, lng] = [+value[0], +value[1]];

  const point = {
    type: 'Point',
    coordinates: [lng, lat],
    center: [lng, lat],
    color: UNSELECTED_COLOR,
    /**
     * Passed to `<CustomPopup />`
     */
    fields: [
      {
        key: '[longitude, latitude]',
        value: `[${[lng, lat].toString()}]`
      }
    ]
  };
  return point;
};

/**
 * Example `type` prop:
 *
 * ```
 * {
 *   name: 'Boolean',
 *   count: 1,
 *   probability: 0.25,
 *   unique: 1,
 *   values: [true]
 * }
 * ```
 */


type props = {
  // _id: string,
  type: InnerFieldType,
  width: number,
  height: number,
  fieldName: string
};

type StateProps = {
  activeStage: number;
  stages: Stage[];
};

type DispatchProps = {
  updateStore: (update: any) => void;
};

// From charts geospatial map-item.
class CoordinatesMinichart extends Component<props & StateProps & DispatchProps> {
  state = {
    ready: false,
    attributionMessage: ''
  };

  // mapRef: HTMLDivElement | null = null;
  mapRef: any = null;

  /**
   * Sets a map view that contains the given geographical bounds
   * with the maximum zoom level possible.
   */
  fitMapBounds() {
    const map = this.mapRef;
    if (!map) {
      return;
    }
    const leaflet = (map as any).leafletElement;

    const values = this.props.type.values.filter(isValidLatLng);

    let bounds = leaflet.getBounds();// @RHYS - USED TO BE: // L.latLngBounds();

    if (values.length === 1) {
      bounds = L.latLng(+values[0][1], +values[0][0]).toBounds(800);
    } else {
      values.forEach(v => {
        bounds.extend(L.latLng(+v[1], +v[0]));
      });
    }
    // If the bounds are equal, we need to extend them otherwise leaflet will error.
    if (bounds._northEast.lat === bounds._southWest.lat &&
      bounds._northEast.lng === bounds._southWest.lng) {
      bounds._northEast.lat = bounds._northEast.lat + 0.1;
      bounds._southWest.lng = bounds._southWest.lng - 0.1;
    }
    leaflet.fitBounds(bounds);
  }

  componentDidUpdate() {
    this.fitMapBounds();
    this.invalidateMapSize();
  }

  whenMapReady = () => {
    if (this.state.ready) {
      return;
    }

    this.getTileAttribution();
    this.setState({ ready: true }, this.invalidateMapSize);
  };

  async getTileAttribution() {
    if (this.state.attributionMessage !== '') {
      return;
    }

    const attributionMessage = await attachAttribution(this.mapRef);
    this.setState({ attributionMessage });
  }

  invalidateMapSize() {
    const mapRef: any = this.mapRef;
    if (!mapRef) {
      return;
    }

    mapRef.container.style.height = `${this.props.height}px`;
    mapRef.container.style.width = `${this.props.width}px`;
    mapRef.leafletElement.invalidateSize();
  }

  onMoveEnd = debounce(() => {
    this.getTileAttribution();
  });

  /**
   * Render child markers for each value in this field type.
   *
   * @returns {react.Component}
   */
  renderMapItems() {
    const {
      fieldName
    } = this.props;

    const values = this.props.type.values.filter(isValidLatLng);

    // TODO: We could highlight the points.

    const geopoints = values
      .map(value => {
        const v = valueToGeoPoint(value);
        v.fields[0].key = fieldName;
        return v;
      });

    return <GeoscatterMapItem data={geopoints} />;
  }

  onCreated = (evt: any) => {
    // console.log('ON CREATED NEED ACTIONS');
    // this.props.actions.geoLayerAdded(this.props.fieldName, evt.layer);

    // in action V
    // this.geoLayers = addLayer(field, layer, this.geoLayers);
    //   this.localAppRegistry.emit('compass:schema:geo-query', generateGeoQuery(this.geoLayers));

    const {
      activeStage,
      fieldName,
      stages
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.FILTER, stages, activeStage);

    const currentStage = newStages[newActiveStage] as FilterStage;

    // TODO: Currently we don't allow 2 layers.
    // In Compass-schema other fields on the query bar are wiped when
    // more than 1 layer is added, since we don't want that we just only allow one.

    // Right now this don't quite work though and shows all layers but only uses last for query.
    if (isLayerWeCanAdd(evt.layer)) {
      // const newLayer = evt.layer;
      // console.log('evt.target:', evt.target);
      // for (const layer in evt.layers) {
      //   if (layer !== newLayer) {
      //     evt.target.removeLayer(layer);
      //   }
      // }
      // if (currentStage.geoLayers) {
      //   evt.target.removeLayer(currentStage.geoLayers);
      // }

      currentStage.geoLayers = addLayer(fieldName, evt.layer, {});
    }

    const geoQuery: any = generateGeoQuery(currentStage.geoLayers);

    if (geoQuery && geoQuery[fieldName]) {
      currentStage.content[fieldName] = geoQuery[fieldName];
    }

    currentStage.sampleDocumentsAreUpToDate = false;

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

  onEdited = (evt: any) => {
    // console.log('ON EDITED NEED ACTIONS');

    // this.props.actions.geoLayersEdited(this.props.fieldName, evt.layers);

    const {
      activeStage,
      fieldName,
      stages
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.FILTER, stages, activeStage);

    const currentStage = newStages[newActiveStage] as FilterStage;

    evt.layers.eachLayer((layer: any) => {
      // this.geoLayerAdded(field, layer);
      currentStage.geoLayers = addLayer(fieldName, layer, currentStage.geoLayers);
    });

    // TODO: Maybe we don't need the whole ensure thing for edit and delete layers.
    currentStage.content = generateGeoQuery(currentStage.geoLayers);

    currentStage.sampleDocumentsAreUpToDate = false;

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

  onDeleted = (evt: any) => {
    // console.log('ON DELETED NEED ACTIONS');

    // this.props.actions.geoLayersDeleted(evt.layers);

    // layers.eachLayer((layer) => {
    //   delete this.geoLayers[layer._leaflet_id];
    // });
    // this.localAppRegistry.emit('compass:schema:geo-query', generateGeoQuery(this.geoLayers));

    const {
      activeStage,
      stages
    } = this.props;

    const {
      newActiveStage,
      newStages
    } = ensureWeAreOnValidStageForAction(STAGES.FILTER, stages, activeStage);

    const currentStage = newStages[newActiveStage] as FilterStage;

    evt.layers.eachLayer((layer: any) => {
      delete currentStage.geoLayers[layer._leaflet_id];
    });

    currentStage.content = generateGeoQuery(currentStage.geoLayers);

    currentStage.sampleDocumentsAreUpToDate = false;

    this.props.updateStore({
      activeStage: newActiveStage,
      stages: newStages
    });
  }

  /**
   * Values plotted to a leaftlet.js map with attribution
   * to our current map provider, HERE.
   * @returns {React.Component}
   */
  render() {
    const { attributionMessage } = this.state;
    return (
      <Map
        minZoom={1}
        viewport={{ center: [0, 0], zoom: 1 }}
        whenReady={this.whenMapReady}
        ref={ref => { this.mapRef = ref; }}
        onMoveend={this.onMoveEnd}
      >
        {this.renderMapItems()}
        <TileLayer url={DEFAULT_TILE_URL} attribution={attributionMessage} />
        <FeatureGroup>
          <EditControl
            position="topright"
            onEdited={this.onEdited}
            onCreated={this.onCreated}
            onDeleted={this.onDeleted}
            // TODO: WE COMMENTED VVV @Rhys
            // onMounted={this.onMounted}
            // onEditStop={this.onEditStop}
            // onDeleteStop={this.onDeleteStop}
            draw={{
              rectangle: true,
              polyline: false,
              marker: false,
              circlemarker: false
            }}
          />
        </FeatureGroup>
      </Map>
    );
  }
}

const mapStateToProps = (state: AppState): StateProps => {
  return {
    activeStage: state.activeStage,
    stages: state.stages
  };
};

const mapDispatchToProps: DispatchProps = {
  // Resets URL validation if form was changed.
  updateStore: (update: any): UpdateStoreAction => ({
    type: ActionTypes.UPDATE_STORE,
    update
  })
};

export default connect(mapStateToProps, mapDispatchToProps)(CoordinatesMinichart);
