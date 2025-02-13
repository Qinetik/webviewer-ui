import React, { forwardRef, useCallback, useContext, useImperativeHandle, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { DragSource, DropTarget } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemTypes, DropLocation, BUFFER_ROOM } from 'constants/dnd';
import actions from 'actions';

import Button from 'components/Button';
import DataElementWrapper from 'components/DataElementWrapper';
import PortfolioContext from 'components/PortfolioPanel/PortfolioContext';
import PortfolioItemContent from 'components/PortfolioItemContent';
import { hasChildren } from 'helpers/portfolioUtils';
import { enableMultiTab } from 'helpers/TabManager';

import './PortfolioItem.scss';

const propTypes = {
  portfolioItem: PropTypes.object.isRequired,
  movePortfolioInward: PropTypes.func,
  movePortfolioBeforeTarget: PropTypes.func,
  movePortfolioAfterTarget: PropTypes.func,
  connectDragSource: PropTypes.func,
  connectDragPreview: PropTypes.func,
  connectDropTarget: PropTypes.func,
  isDragging: PropTypes.bool,
  isDraggedUpwards: PropTypes.bool,
  isDraggedDownwards: PropTypes.bool,
};

const PortfolioItem = forwardRef(({
  portfolioItem,
  movePortfolioInward,
  movePortfolioBeforeTarget,
  movePortfolioAfterTarget,
  connectDragSource,
  connectDragPreview,
  connectDropTarget,
  isDragging,
  isDraggedUpwards,
  isDraggedDownwards,
}, ref) => {
  const {
    activePortfolioItem,
    setActivePortfolioItem,
    isPortfolioItemActive,
    isAddingNewFolder,
    setAddingNewFolder,
  } = useContext(PortfolioContext);
  const dispatch = useDispatch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isHovered, setHovered] = useState(false); // when the popup menu is open, the container will have a background
  const isActive = isPortfolioItemActive(portfolioItem);

  const elementRef = useRef(null);
  connectDragSource(elementRef);
  connectDragPreview(getEmptyImage(), { captureDraggingState: true });
  connectDropTarget(elementRef);
  const opacity = isDragging ? 0.5 : 1;
  useImperativeHandle(ref, () => ({
    getNode: () => elementRef.current,
  }));

  const togglePortfolioItem = useCallback(() => {
    setIsExpanded((expand) => !expand);
  }, []);

  const onSingleClick = useCallback(() => {
    // If the item is in renaming-mode, clicking on it won't do anything
    if (isRenaming) {
      return;
    }

    // TODO: open document here
    setActivePortfolioItem(portfolioItem.id);

    // If the panel is in add-folder-mode, reset it when clicking on other items
    if (isAddingNewFolder) {
      setAddingNewFolder(false);
    }
  }, [setActivePortfolioItem, activePortfolioItem, isAddingNewFolder]);

  return (
    <div
      ref={(!isAddingNewFolder) ? elementRef : null}
      className="outline-drag-container"
      style={{ opacity }}
    >
      <div className="outline-drag-line" style={{ opacity: isDraggedUpwards ? 1 : 0 }} />
      <DataElementWrapper
        className={classNames({
          'bookmark-outline-single-container': true,
          'editing': isRenaming,
          'default': !isRenaming,
          'selected': isActive,
          'hover': isHovered && !isActive,
        })}
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSingleClick()}
        onClick={onSingleClick}
        onDoubleClick={async () => {
          const extensionRegExp = /(?:\.([^.?]+))?$/;
          const extension = extensionRegExp.exec(portfolioItem.name)[1];
          const isOpenableFile = ['pdf', 'doc', 'docx', 'xod'].includes(extension);
          if (isOpenableFile) {
            dispatch(enableMultiTab());
            dispatch(actions.addPortfolioTab(portfolioItem));
          }
        }}
      >
        <div
          className={classNames({
            'outline-treeview-toggle': true,
            expanded: isExpanded,
          })}
          style={{ marginLeft: portfolioItem.getNestedLevel() * 12 }}
        >
          {hasChildren(portfolioItem) &&
            <Button
              img="icon-chevron-right"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                togglePortfolioItem();
              }}
            />
          }
        </div>

        <PortfolioItemContent
          name={portfolioItem.name}
          id={portfolioItem.id}
          isFolder={portfolioItem.isFolder}
          isPortfolioRenaming={isRenaming}
          setPortfolioRenaming={setIsRenaming}
          setIsHovered={setHovered}
        />
      </DataElementWrapper>

      <div className="outline-drag-line" style={{ opacity: isDraggedDownwards ? 1 : 0 }} />

      {isExpanded &&
        portfolioItem?.children.map((child) => (
          <PortfolioItemNested
            portfolioItem={child}
            key={child.id}
            movePortfolioInward={movePortfolioInward}
            movePortfolioBeforeTarget={movePortfolioBeforeTarget}
            movePortfolioAfterTarget={movePortfolioAfterTarget}
          />
        ))
      }
    </div>
  );
});

PortfolioItem.propTypes = propTypes;
PortfolioItem.displayName = 'PortfolioItem';

const PortfolioItemNested = DropTarget(
  ItemTypes.PORTFOLIO,
  {
    hover(props, dropTargetMonitor, dropTargetContainer) {
      if (!dropTargetContainer) {
        return;
      }

      const dragObject = dropTargetMonitor.getItem();
      if (!dragObject) {
        return;
      }

      const { dragPortfolioItem, dragSourceNode } = dragObject;
      const { portfolioItem: dropPortfolioItem } = props;

      const dropTargetNode = dropTargetContainer.getNode();
      // portfolio file is not a valid drop target
      if (!dragSourceNode || !dropTargetNode || !dropPortfolioItem.isFolder) {
        return;
      }

      const portfolioItemIsBeingDraggedIntoDescendant = dragSourceNode.contains(dropTargetNode);
      if (portfolioItemIsBeingDraggedIntoDescendant) {
        dragObject.dropTargetNode = undefined;
        dragObject.dropLocation = DropLocation.INITIAL;
        return;
      }

      dragObject.dropTargetNode = dropTargetNode;
      const dragId = dragPortfolioItem.id;
      const hoverId = dropPortfolioItem.id;
      // do nothing if drag object and drop object are the same item
      // depends on the data structure, could have more conditions here
      if (dragId === hoverId) {
        return;
      }

      const dropTargetBoundingRect = dropTargetNode.getBoundingClientRect();
      const dropTargetVerticalMiddlePoint = (dropTargetBoundingRect.bottom - dropTargetBoundingRect.top) / 2;
      const clientOffset = dropTargetMonitor.getClientOffset();
      const dropTargetClientY = clientOffset.y - dropTargetBoundingRect.top;
      switch (true) {
        case dropTargetClientY <= dropTargetVerticalMiddlePoint + BUFFER_ROOM && dropTargetClientY >= dropTargetVerticalMiddlePoint - BUFFER_ROOM:
          dragObject.dropLocation = DropLocation.ON_TARGET_HORIZONTAL_MIDPOINT;
          if (dropTargetMonitor.isOver({ shallow: true })) {
            dropTargetNode.classList.add('isNesting');
          }
          setTimeout(() => {
            if (dragObject?.dropTargetNode !== dropTargetNode) {
              dropTargetNode.classList.remove('isNesting');
            }
          }, 100);
          break;
        case dropTargetClientY > dropTargetVerticalMiddlePoint + BUFFER_ROOM:
          dragObject.dropLocation = DropLocation.BELOW_TARGET;
          dropTargetNode.classList.remove('isNesting');
          break;
        case dropTargetClientY < dropTargetVerticalMiddlePoint - BUFFER_ROOM:
          dragObject.dropLocation = DropLocation.ABOVE_TARGET;
          dropTargetNode.classList.remove('isNesting');
          break;
        default:
          dragObject.dropLocation = DropLocation.INITIAL;
          dropTargetNode.classList.remove('isNesting');
          break;
      }
    },
    drop(props, dropTargetMonitor, dropTargetContainer) {
      if (!dropTargetContainer) {
        return;
      }
      const dragObject = dropTargetMonitor.getItem();
      const { dragPortfolioItem, dropTargetNode } = dragObject;
      const { portfolioItem: dropPortfolioItem, movePortfolioInward, movePortfolioBeforeTarget, movePortfolioAfterTarget } = props;

      if (!dropTargetNode) {
        return;
      }

      switch (dragObject.dropLocation) {
        case DropLocation.ON_TARGET_HORIZONTAL_MIDPOINT:
          movePortfolioInward(dragPortfolioItem, dropPortfolioItem);
          break;
        case DropLocation.ABOVE_TARGET:
          movePortfolioBeforeTarget(dragPortfolioItem, dropPortfolioItem);
          break;
        case DropLocation.BELOW_TARGET:
          movePortfolioAfterTarget(dragPortfolioItem, dropPortfolioItem);
          break;
        default:
          break;
      }
      dropTargetNode.classList.remove('isNesting');
      dragObject.dropLocation = DropLocation.INITIAL;
    }
  },
  (connect, dropTargetState) => ({
    connectDropTarget: connect.dropTarget(),
    isDraggedUpwards: dropTargetState.isOver({ shallow: true }) && (dropTargetState.getItem()?.dropLocation === DropLocation.ABOVE_TARGET),
    isDraggedDownwards: dropTargetState.isOver({ shallow: true }) && (dropTargetState.getItem()?.dropLocation === DropLocation.BELOW_TARGET),
  })
)(DragSource(
  ItemTypes.PORTFOLIO,
  {
    beginDrag: (props, dragSourceMonitor, dragSourceContainer) => ({
      sourceId: dragSourceMonitor.sourceId,
      dragPortfolioItem: props.portfolioItem,
      dragSourceNode: dragSourceContainer.getNode(),
      dropLocation: DropLocation.INITIAL,
    }),
  },
  (connect, dragSourceState) => ({
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: dragSourceState.isDragging(),
  })
)(PortfolioItem));

PortfolioItemNested.propTypes = propTypes;

export default PortfolioItemNested;
