import {Switch, Redirect, Route} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import Home from './pages/Home/Home.js';
import { useState } from 'react';
import { darkTheme, lightTheme } from './utils/themes.js';
import StuDashboard from './pages/StuDashboard/StuDashboard.js';
import InsDashboard from './pages/InsDashboard/InsDashboard.js';
import { useSelector } from 'react-redux';
import CoursePage from './pages/coursePage/coursePage.js';
import ProfilePage from './pages/profilePage/ProfilePage.js';
import Search from './pages/search/Search.js';

const App = ()=> {

  const [mode, setMode] = useState('dark');
  const {authUser} = useSelector((state) => (state.auth));

  return (
    <div>
      <ThemeProvider theme={mode==='dark' ? darkTheme : lightTheme}>
        <Switch>
            <Route path="/" exact component={Home} /> 
            <Route path="/dashboard" exact component={
              ()=>{
                if(authUser?.enrollmentStatus==='UNKNOWN' || !authUser?.id){
                  return <Redirect to="/"/>
                }else if(authUser?.currentRole==='STU'){
                  return <StuDashboard/>
                }else if(authUser?.currentRole==='INS'){
                  return <InsDashboard/>
                }else {
                  return <Redirect to="/" />
                }
              }
            }/>
            <Route path="/course/:id" exact component={CoursePage} />
            <Route path="/profile/:id" exact component={ProfilePage} />
            <Route path="/search" exact component={Search}/>
        </Switch>
      </ThemeProvider>
    </div>
  );
}

export default App;
