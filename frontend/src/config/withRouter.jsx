import {
    useLocation,
    useNavigate,
    useParams,
} from "react-router-dom";

// function withRouter(Component) {
//     function ComponentWithRouterProp(props) {
//         let location = useLocation();
//         let navigate = useNavigate();
//         let params = useParams();
//         return (
//             <Component
//                 { ...props }
//                 router={ { location, navigate, params } }
//             />
//         );
//     }

//     return ComponentWithRouterProp;
// }

const withRouter = WrappedComponent => props => {
    const params = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    // etc... other react-router-dom v6 hooks

    return (
        <WrappedComponent
            { ...props }
            params={ params }
            navigate={ navigate }
            location={ location }
        // etc...
        />
    );
};

export default withRouter