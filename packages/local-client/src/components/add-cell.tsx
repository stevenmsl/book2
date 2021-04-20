import "./add-cell.css";
import { useActions } from "../hooks/use-actions";

/*
  Design decisions:
  - Why always inserts a new cell after the current cell
    but not before?
    - this is to make sure that React won't re-render the
      AddCell you are clicking on to creat a new cell as
      the AddCell's key will remain the same
    - on the other hand if we were to add the new cell before
      the current cell it will change the key of the AddCell
      you are clicking on to create a new Cell 
      (as the AddCell would get pushed down the list to 
      make room for the newly added cell). This will cause
      React to re-render the AddCell and leads to some 
      unwanted side effects.  
     
*/

interface AddCellProps {
  previousCellId: string | null;
  forceVisible?: boolean;
}

const AddCell: React.FC<AddCellProps> = ({ previousCellId, forceVisible }) => {
  const { insertCellAfter } = useActions();
  return (
    <div className={`add-cell ${forceVisible && "force-visible"}`}>
      <div className="add-buttons">
        <button
          className="button is-rounded is-primary is-small"
          onClick={() => insertCellAfter(previousCellId, "code")}
        >
          <span className="icon is-small">
            <i className="fas fa-plus" />
          </span>
          <span>Code</span>
        </button>
        <button
          className="button is-rounded is-primary is-small"
          onClick={() => insertCellAfter(previousCellId, "text")}
        >
          <span className="icon is-small">
            <i className="fas fa-plus" />
          </span>
          <span>Text</span>
        </button>
      </div>
      <div className="divider"></div>
    </div>
  );
};

export default AddCell;
