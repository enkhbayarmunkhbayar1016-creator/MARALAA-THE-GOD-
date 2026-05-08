import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Team1 from './team1/Index';
import Team2 from './team2/Index';
import Team3 from './team3/Index';
import Team4 from './team4/Index';
import Team5 from './team5/Index';
import Team6 from './team6/Index';
import MasterLayout from './layout/MasterLayout';
import NotFound from './layout/NotFound';
import { UserProvider } from './contexts/UserContext';
import Login from './layout/Login';


function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<MasterLayout />}>
            <Route index element={<Team1 />} />
            <Route path='/team1/*' element={<Team1 />} />
            <Route path='/team2/*' element={<Team2 />} />
            <Route path='/team3/*' element={<Team3 />} />
            <Route path='/team4/*' element={<Team4 />} />
            <Route path='/team5/*' element={<Team5 />} />
            <Route path='/team6/*' element={<Team6 />} />

            <Route path='/login' element={<Login />} />
            <Route path='*' element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
