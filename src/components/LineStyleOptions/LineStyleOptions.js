import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from 'components/Dropdown';
import { defaultStrokeStyles } from 'constants/strokeStyleIcons';

import './LineStyleOptions.scss';

const startLineStyles = [
  { className: 'linestyle-image', key: 'None', src: 'icon-linestyle-none' },
  { className: 'linestyle-image shift-alignment', key: 'ClosedArrow', src: 'icon-linestyle-start-arrow-closed' },
  { className: 'linestyle-image shift-alignment', key: 'OpenArrow', src: 'icon-linestyle-start-arrow-open' },
  { className: 'linestyle-image shift-alignment', key: 'ROpenArrow', src: 'icon-linestyle-start-arrow-open-reverse' },
  { className: 'linestyle-image shift-alignment', key: 'RClosedArrow', src: 'icon-linestyle-start-arrow-closed-reverse' },
  { className: 'linestyle-image shift-alignment', key: 'Butt', src: 'icon-linestyle-start-butt' },
  { className: 'linestyle-image shift-alignment', key: 'Circle', src: 'icon-linestyle-start-circle' },
  { className: 'linestyle-image shift-alignment', key: 'Diamond', src: 'icon-linestyle-start-diamond' },
  { className: 'linestyle-image shift-alignment', key: 'Square', src: 'icon-linestyle-start-square' },
  { className: 'linestyle-image shift-alignment', key: 'Slash', src: 'icon-linestyle-start-slash' },
];

const endLineStyles = [
  { className: 'linestyle-image', key: 'None', src: 'icon-linestyle-none' },
  { className: 'linestyle-image shift-alignment', key: 'ClosedArrow', src: 'icon-linestyle-end-arrow-closed' },
  { className: 'linestyle-image shift-alignment', key: 'OpenArrow', src: 'icon-linestyle-end-arrow-open' },
  { className: 'linestyle-image shift-alignment', key: 'ROpenArrow', src: 'icon-linestyle-end-arrow-open-reverse' },
  { className: 'linestyle-image shift-alignment', key: 'RClosedArrow', src: 'icon-linestyle-end-arrow-closed-reverse' },
  { className: 'linestyle-image shift-alignment', key: 'Butt', src: 'icon-linestyle-end-butt' },
  { className: 'linestyle-image shift-alignment', key: 'Circle', src: 'icon-linestyle-end-circle' },
  { className: 'linestyle-image shift-alignment', key: 'Diamond', src: 'icon-linestyle-end-diamond' },
  { className: 'linestyle-image shift-alignment', key: 'Square', src: 'icon-linestyle-end-square' },
  { className: 'linestyle-image shift-alignment', key: 'Slash', src: 'icon-linestyle-end-slash' },
];

const middleLineStyles = defaultStrokeStyles;

function LineStyleOptions({ properties, onLineStyleChange }) {
  const [t] = useTranslation();
  const [selectedStartLineStyle, setSelectedStartLineStyle] = useState(properties.StartLineStyle);
  const [selectedEndLineStyle, setSelectedEndLineStyle] = useState(properties.EndLineStyle);
  const [selectedMiddleLineStyle, setSelectedMiddleLineStyle] = useState(properties.StrokeStyle);

  function onClickStartLineStyle(key) {
    setSelectedStartLineStyle(key);
    onLineStyleChange('start', key);
  }

  function onClickMiddleLineStyle(key) {
    setSelectedMiddleLineStyle(key);
    onLineStyleChange('middle', key);
  }

  function onClickEndLineStyle(key) {
    setSelectedEndLineStyle(key);
    onLineStyleChange('end', key);
  }

  const lineEndingDropdownWidth = 62;

  return (
    <div className="LineStyleOptions">
      <div className="LayoutTitle">{t('option.lineStyleOptions.title')}</div>
      <div className="StyleContainer">
        <Dropdown
          dataElement="startLineStyleDropdown"
          images={startLineStyles}
          width={lineEndingDropdownWidth}
          onClickItem={onClickStartLineStyle}
          currentSelectionKey={selectedStartLineStyle}
        />

        <Dropdown
          dataElement="middleLineStyleDropdown"
          images={middleLineStyles}
          width={lineEndingDropdownWidth}
          onClickItem={onClickMiddleLineStyle}
          currentSelectionKey={selectedMiddleLineStyle}
        />

        <Dropdown
          dataElement="endLineStyleDropdown"
          images={endLineStyles}
          width={lineEndingDropdownWidth}
          onClickItem={onClickEndLineStyle}
          currentSelectionKey={selectedEndLineStyle}
        />
      </div>
    </div>
  );
}

export default LineStyleOptions;