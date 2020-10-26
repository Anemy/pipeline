import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';

import styles from './marker-popup.less';

const CustomPopup = ({ fields }: any) => {
  return (
    <Popup closeButton={false} className={styles.popup}>
      <CustomPopupFields fields={fields} />
    </Popup>
  );
};

CustomPopup.propTypes = {
  fields: PropTypes.array,
};

const CustomPopupFields = ({ fields }: any) => {
  return fields
    .filter((field: any) => field.key)
    .map((field: any) => {
      const { key, value } = field;

      return (
        <span className={styles.line} key={key}>
          <span className={styles.key}>{key}:</span>{' '}
          <span className={styles.value}>{value}</span>
        </span>
      );
    });
};

export default CustomPopup;
export { CustomPopup, CustomPopupFields };
