import React, { useEffect } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { useDispatch, useSelector, shallowEqual } from "react-redux";

import Button from "components/Button";

import core from "core";
import toolStylesExist from "helpers/toolStylesExist";
import getToolStyles from "helpers/getToolStyles";
import hotkeysManager from "helpers/hotkeysManager";
import { mapToolNameToKey } from "constants/map";
import defaultTool from 'constants/defaultTool';
import actions from "actions";
import selectors from "selectors";

import "./ToolButton.scss";

const propTypes = {
  toolName: PropTypes.string.isRequired,
  group: PropTypes.string
};

const ToolButton = ({
  isSwap,
  toolName,
  isStylingOpen,
  ...restProps
}) => {
  const [
    activeToolName,
    isActive,
    iconColor,
    // use this to trigger rerender so the color will be right
    // TODO: fix the issue properly. Can listen to toolUpdated
    // eslint-disable-next-line
    activeToolStyles,
    { group = "", showColor, ...restObjectData },
    customOverrides,
  ] = useSelector(
    state => [
      selectors.getActiveToolName(state),
      selectors.getActiveToolName(state) === toolName,
      selectors.getIconColor(state, mapToolNameToKey(toolName)),
      selectors.getActiveToolStyles(state),
      selectors.getToolButtonObject(state, toolName),
      selectors.getCustomElementOverrides(
        state,
        selectors.getToolButtonDataElement(state, toolName),
      ),
    ],
    shallowEqual,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof customOverrides?.disable === "undefined") {
      return;
    }

    if (customOverrides.disable) {
      hotkeysManager.off(toolName);
    } else {
      hotkeysManager.on(toolName);
    }
  }, [customOverrides, toolName]);

  const handleSwap = () => {
    dispatch(actions.swapTools(toolName, activeToolName));
    core.setToolMode(toolName);
  };

  const handleClick = () => {
    if (isActive) {
      if (toolStylesExist(toolName) && toolName !== "AnnotationCreateStamp") {
        dispatch(actions.toggleElement("toolStylePopup"));
        if (toolName === "AnnotationCreateRubberStamp") {
          core.setToolMode(defaultTool);
          // dispatch(actions.setActiveToolGroup(''));
        }
      }
    } else {
      if (group === 'miscTools') {
        dispatch(actions.closeElement("toolStylePopup"));
      }

      core.setToolMode(toolName);
      dispatch(actions.setActiveToolGroup(group));
      // if (group === 'miscTools') {
      //   dispatch(actions.closeElement("toolStylePopup"));
      // }
      if (toolName === "AnnotationCreateRubberStamp") {
        dispatch(actions.openElement("toolStylePopup"));
      }
    }
  };

  const toolStyles = getToolStyles(toolName);
  let color = "";

  if ((showColor === "always" || (showColor === "active" && isActive))) {
    color = toolStyles[iconColor]?.toHexString?.();
  }

  const ButtonComponent = (
    <Button
      className={classNames({
        "tool-button": true,
        hasStyles: toolStylesExist(toolName),
      })}
      onClick={isSwap ? handleSwap : handleClick}
      isActive={isActive}
      color={color}
      {...restProps}
      {...restObjectData}
    />
  );

  return ButtonComponent;
};

ToolButton.propTypes = propTypes;

export default ToolButton;
