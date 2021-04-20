import { useMemo } from "react";
import { useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators } from "../state";

/*
  - the purpose of this hook is that the clients
    doesn't have to configure the dispatch over
    and over again every time they need dispatch
    an action as the dispatch has been pre-configured
    here
  - instead the clients can just call the individual 
    action generator destructured from the return 
    value of this hook:
    const { updateCell } = useActions();   
*/

export const useActions = () => {
  const dispatch = useDispatch();
  /*
    useMemo
      - return the same function in the same 
        memory location
      - this will make sure a re-render will 
        not be trigger for the components
        who need to put the action creators
        in a dependency array
      - you don't need to specify the actionCreators
        in the dependency array as it's coming from
        the import statements   
  */
  return useMemo(() => {
    return bindActionCreators(actionCreators, dispatch);
  }, [dispatch]);
};
