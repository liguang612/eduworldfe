import React, { useState, useEffect, useCallback } from 'react';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import './ItemConnector.css';

interface Item {
  id: string;
  label: string;
}

export interface Connection {
  from: string;
  to: string;
}

interface ItemConnectorProps {
  leftItems: Item[];
  rightItems: Item[];
  initialConnections?: Connection[];
  onChange: (connections: Connection[]) => void;
  readOnly?: boolean;
}

const ItemConnector: React.FC<ItemConnectorProps> = ({
  leftItems,
  rightItems,
  initialConnections = [],
  onChange,
  readOnly = false,
}) => {
  const [selectedLeftItem, setSelectedLeftItem] = useState<string | null>(null);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const updateXarrow = useXarrow();

  useEffect(() => {
    setConnections(initialConnections);
  }, [initialConnections]);

  const handleLeftItemClick = useCallback((itemId: string) => {
    if (readOnly) return;
    setSelectedLeftItem(prev => (prev === itemId ? null : itemId));
    setTimeout(updateXarrow, 0);
  }, [readOnly, updateXarrow]);

  const handleRightItemClick = useCallback((rightItemId: string) => {
    if (readOnly || !selectedLeftItem) return;

    const newConnection = { from: selectedLeftItem, to: rightItemId };
    let newConnections;

    const existingConnectionIndex = connections.findIndex(
      c => c.from === newConnection.from && c.to === newConnection.to
    );

    if (existingConnectionIndex > -1) {
      newConnections = connections.filter((_, index) => index !== existingConnectionIndex);
    } else {
      newConnections = [...connections, newConnection];
    }
    setConnections(newConnections);
    onChange(newConnections);
    setTimeout(updateXarrow, 0);
  }, [readOnly, selectedLeftItem, connections, onChange, updateXarrow]);

  const getSafeId = (prefix: string, id: string) =>
    `${prefix}-${id.replace(/[^a-zA-Z0-9-_]/g, '')}`;

  return (
    <div className="item-connector-wrapper">
      <Xwrapper>
        <div className="item-connector-container">
          {/* Cột Trái */}
          <div className="column" id="left-column">
            <h4>Cột Trái</h4>
            {leftItems.map((item) => (
              <div
                key={item.id}
                id={getSafeId('left', item.id)}
                onClick={() => handleLeftItemClick(item.id)}
                className={`item ${selectedLeftItem === item.id ? 'selected' : ''} ${readOnly ? 'readonly' : ''}`}
                tabIndex={readOnly ? -1 : 0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLeftItemClick(item.id); }}
                role="button"
              >
                <p>{item.label}</p>
              </div>
            ))}
          </div>

          {/* Cột Phải */}
          <div className="column" id="right-column">
            <h4>Cột Phải</h4>
            {rightItems.map((item) => {
              const isConnectedToCurrentSelectedLeft = selectedLeftItem && connections.some(c => c.from === selectedLeftItem && c.to === item.id);
              return (
                <div
                  key={item.id}
                  id={getSafeId('right', item.id)}
                  onClick={() => handleRightItemClick(item.id)}
                  className={`item ${isConnectedToCurrentSelectedLeft ? 'connected-to-selected' : ''} ${readOnly ? 'readonly' : ''}`}
                  tabIndex={readOnly ? -1 : 0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleRightItemClick(item.id); }}
                  role="button"
                >
                  <p>{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vẽ các đường nối */}
        {connections.map((conn, index) => (
          <Xarrow
            key={`${conn.from}-${conn.to}-${index}`}
            start={getSafeId('left', conn.from)}
            end={getSafeId('right', conn.to)}
            strokeWidth={2}
            color={readOnly ? "#aaa" : "cornflowerblue"}
            path="smooth"
            headSize={6}
            curveness={0.8}
            showHead={!readOnly}
            passProps={{
              className: readOnly ? 'xarrow-readonly' : 'xarrow-editable',
            }}
          />
        ))}
      </Xwrapper>
    </div>
  );
};

export default ItemConnector;