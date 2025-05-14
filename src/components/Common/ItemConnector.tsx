// src/components/ItemConnector.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';
import './ItemConnector.css'; // Chúng ta sẽ tạo file CSS này sau

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
  readOnly?: boolean; // Để xử lý chế độ chỉ đọc của SurveyJS
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
  const updateXarrow = useXarrow(); // Hook để cập nhật lại các đường nối khi cần

  useEffect(() => {
    setConnections(initialConnections); // Đồng bộ với initialConnections nếu nó thay đổi từ bên ngoài
  }, [initialConnections]);

  const handleLeftItemClick = useCallback((itemId: string) => {
    if (readOnly) return;
    setSelectedLeftItem(prev => (prev === itemId ? null : itemId)); // Click để chọn, click lại để bỏ chọn
    setTimeout(updateXarrow, 0); // Đảm bảo các thay đổi DOM được áp dụng trước khi xarrow cập nhật
  }, [readOnly, updateXarrow]);

  const handleRightItemClick = useCallback((rightItemId: string) => {
    if (readOnly || !selectedLeftItem) return;

    const newConnection = { from: selectedLeftItem, to: rightItemId };
    let newConnections;

    const existingConnectionIndex = connections.findIndex(
      c => c.from === newConnection.from && c.to === newConnection.to
    );

    if (existingConnectionIndex > -1) {
      // Nếu kết nối đã tồn tại, xóa nó (toggle)
      newConnections = connections.filter((_, index) => index !== existingConnectionIndex);
    } else {
      // Nếu chưa tồn tại, thêm kết nối mới
      newConnections = [...connections, newConnection];
    }
    setConnections(newConnections);
    onChange(newConnections);
    // Không bỏ chọn selectedLeftItem để cho phép nối nhiều item từ một nguồn
    setTimeout(updateXarrow, 0);
  }, [readOnly, selectedLeftItem, connections, onChange, updateXarrow]);

  // Hàm giúp tạo ID an toàn cho các phần tử HTML
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
                {item.label}
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
                  {item.label}
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
            path="smooth" // "grid", "straight"
            headSize={6}
            curveness={0.8} // Điều chỉnh độ cong của đường nối
            showHead={!readOnly}
            passProps={{
              className: readOnly ? 'xarrow-readonly' : 'xarrow-editable',
              // Nếu muốn có thể bắt sự kiện trên đường nối (phức tạp hơn)
              // onClick: () => !readOnly && handleArrowClick(conn),
            }}
          />
        ))}
      </Xwrapper>
    </div>
  );
};

export default ItemConnector;