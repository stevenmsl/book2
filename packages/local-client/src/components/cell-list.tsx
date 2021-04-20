import "./cell-list.css";
import { Fragment, useEffect } from "react";
import { useTypedSelector } from "../hooks/use-typed-selector";
import CellListItem from "./cell-list-item";
import AddCell from "./add-cell";
import { useActions } from "../hooks/use-actions";

/*
  design decisions 
  - why add AddCell here not in CellLisItem
    - we are showing an extra AddCell at the 
      very end of the list, which means we need
      to render it separately in this case       
*/

const CellList: React.FC = () => {
  /*
    - use destructure to retrieve the order and data
      properties out of the cells
    - re-organize the data array so it follows the 
      order specified in the order property
  */
  const cells = useTypedSelector(({ cells: { order, data } }) =>
    order.map((id) => data[id])
  );

  const { fetchCells } = useActions();

  useEffect(() => {
    fetchCells();
  }, []);

  const renderCells = cells.map((cell) => (
    <Fragment key={cell.id}>
      <AddCell previousCellId={cell.id} />
      <CellListItem cell={cell} />
    </Fragment>
  ));
  return (
    <div className="cell-list">
      {renderCells}
      <AddCell forceVisible={cells.length === 0} previousCellId={null} />
    </div>
  );
};

export default CellList;
