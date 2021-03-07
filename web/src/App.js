import React, { useEffect, useContext } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Home from './components/home/home';
import PrivateRoute from './components/PrivateRoute';
import StickyFooter from './components/stickyFooter/StickyFooter';
import Dashboard from './components/Dashboard/Dashboard';
import Menu from "./components/SideBar/Menu";
import SignIn from './components/signin/SignIn';
import SignUp from './components/signup/SignUp';
import ActivateDestination from './components/activedestination/ActiveDestination';
import Profile from './components/profile/Profile';
import MyContext from './components/mycontext/MyContext';
import config from './constants/config.json';

const API_URL = config.API_LOCAL;

const routes = [
  {
    path: "/",
    exact: true,
    private: false,
    main: () => <Home />
  },
  {
    path: "/dashboard",
    private: true,
    main: () => <Dashboard />
  },
  {
    path: "/signin",
    private: false,
    main: () => <SignIn />
  },
  {
    path: '/signup',
    private: false,
    main: () => <SignUp />
  },
  {
    path: '/active/:id',
    private: false,
    main: () => <ActivateDestination />
  }, {
    path: '/profile',
    private: true,
    main: () => <Profile />
  }
];

const useStyles = makeStyles((theme) => ({
  body: {
    display: 'flex',
    minHeight: "calc(100vh - 35vh)",
  },
  content: {
    margin: "auto",
    marginTop: '64px',
    width: '100%'
  },
}));

function App() {
  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useContext(MyContext);

  useEffect(() => {

    async function authen() {
      const jwtToken = window.localStorage.getItem('jwtToken');
      const res = await fetch(`${API_URL}/users/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`
        }
      });
      if (res.status === 200) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
    authen();
  }, [])

  return (
    <Router>
      <div>
        <CssBaseline />
        {/* <MyProvider> */}
        <div className={classes.body}>
          <Menu />
          <div className={classes.content}>
            <Switch>
              {routes.map((route, index) => {
                return (route.private ?
                  <PrivateRoute
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    children={<route.main />}
                  />
                  :
                  <Route
                    key={index}
                    path={route.path}
                    exact={route.exact}
                    children={<route.main />}
                  />
                )
              })}
              <Route path="*">
                <Home />
              </Route>
            </Switch>
          </div>
        </div>
        {/* </MyProvider> */}
        <StickyFooter />
      </div>
    </Router>
  );
}

export default App;