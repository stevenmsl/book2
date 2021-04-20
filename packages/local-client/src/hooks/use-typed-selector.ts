import { useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState } from "../state";

/*
  - this hook allows you to select a piece of data from the store
    without the need to specify the type of the root state over
    and over again
  - basically we use TypedUseSelectorHook to sepcify the root
    state type in the useSelector hook and hence narrow down 
    the type of the useTypedSelector  
*/
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector;
