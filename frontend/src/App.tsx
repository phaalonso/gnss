import React from 'react';
import { BrowserRouter as Router, Switch } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import NotFound from './pages/NotFound';
import Route from "./components/Route";
import Login from "./pages/Login";

const App: React.FC = () => {
    return (
        <Router>
            <Switch>
                <Route path="/" exact isPrivate component={Dashboard}/>
                <Route path="/login" exact component={Login}/>
				<Route component={NotFound}/>
            </Switch>
        </Router>
    );
}

export default App;
