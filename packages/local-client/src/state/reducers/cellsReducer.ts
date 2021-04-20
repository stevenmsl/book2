import produce from "immer";
import { ActionType } from "../action-types";
import { Action } from "../actions";
import { Cell } from "../cell";

interface CellsState {
  loading: boolean;
  error: string | null;
  order: string[];
  data: {
    [key: string]: Cell;
  };
}

const initialState: CellsState = {
  loading: false,
  error: null,
  order: [],
  data: {},
};

/*
  - use immer so you can manipulate the state directly
  - you don't need to return the state as you normally
    would without using immer
  - however, you need to pass in the initial state to
    the produce method separately in the second parameter
    so the type of the cells property in the state will
    be inferred as CellsState not CellsState | undefined    
*/

const reducer = produce((state: CellsState = initialState, action: Action) => {
  switch (action.type) {
    case ActionType.SAVE_CELLS_ERROR:
      state.error = action.payload;
      return;
    case ActionType.FETCH_CELLS:
      state.loading = true;
      state.error = null;
      return;
    case ActionType.FETCH_CELLS_COMPLETE:
      state.order = action.payload.map((cell) => cell.id);
      state.data = action.payload.reduce(
        (acc, cell) => {
          acc[cell.id] = cell;
          return acc;
        },
        // type the initial val so TS won't complain
        {} as CellsState["data"]
      );
      return;
    case ActionType.FETCH_CELLS_ERROR:
      state.loading = false;
      state.error = action.payload;
      return;
    case ActionType.UPDATE_CELL:
      const { id, content } = action.payload;
      state.data[id].content = content;
      return;
    case ActionType.DELETE_CELL:
      delete state.data[action.payload];
      state.order = state.order.filter((id) => id !== action.payload);
      return;
    case ActionType.MOVE_CELL:
      const { direction } = action.payload;
      const index = state.order.findIndex((id) => id === action.payload.id);
      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex > state.order.length - 1) {
        return;
      }

      state.order[index] = state.order[targetIndex];
      state.order[targetIndex] = action.payload.id;
      return;
    case ActionType.INSERT_CELL_AFTER:
      const cell: Cell = {
        content: "",
        type: action.payload.type,
        id: radomId(),
      };

      state.data[cell.id] = cell;

      const foundIndex = state.order.findIndex(
        (id) => id === action.payload.id
      );

      if (foundIndex < 0) {
        // just add it to the front
        state.order.unshift(cell.id);
      } else {
        // insert the new cell after the found cell
        state.order.splice(foundIndex + 1, 0, cell.id);
      }
      return;
    default:
      return state;
  }
}, initialState);

const radomId = () => {
  return Math.random().toString(36).substr(2, 5);
};

export default reducer;
