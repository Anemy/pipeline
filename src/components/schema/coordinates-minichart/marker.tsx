import React from 'react';
import PropTypes from 'prop-types';
import { CircleMarker } from 'react-leaflet';

const CustomPopup = require('./marker-popup');

const DEFAULT_STYLES = {
  weight: 1,
  radius: 5,
  fillOpacity: 0.6
};

// Give a popup to a react-leaflet marker component
// e.g a CircleMarker, Polygon, Polyline, Rectangle
const popupComponent = (ParentComponent: any, properties: any) => {
  const props = {
    ...DEFAULT_STYLES,
    ...properties,
  };

  return (
    <ParentComponent
      {...props}
      onMouseOver={(e: any) => {
        e.target.openPopup();
      }}
      onMouseOut={(e: any) => {
        e.target.closePopup();
      }}
    >
      <CustomPopup {...props} />
    </ParentComponent>
  );
};

popupComponent.propTypes = {
  fields: PropTypes.array,
};

const Marker = ({ data }: any) =>
  data.map((point: any, i: number) => {
    point.key = i;

    return popupComponent(CircleMarker, point);
  });

Marker.propTypes = {
  data: PropTypes.array.isRequired,
};

export default Marker;
export { Marker, popupComponent };
