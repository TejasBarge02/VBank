import './App.scss';
import React, { useContext } from 'react'
import {Routes, Route, Navigate} from 'react-router-dom'

import Homepage from './Pages/Home/Homepage';
import AdminPanel from './Pages/AdminPanel/AdminPanel'
import UserDashboard from './Pages/UserDashboard/UserDashboard'
import { AuthContext } from './context/Auth-context';

function App() {

  const {isAdmin, jwt} = useContext(AuthContext)
  console.log(isAdmin)

  return (
    <div className="App">
      {jwt
        ?
        isAdmin === 'admin'
          ?
          <Routes>
            <Route path='/AdminPanel/*' element={<AdminPanel/>}/>
            <Route path="*" element={<Navigate to ="/AdminPanel" replace/>}/>
          </Routes>
          :
          <Routes>
            <Route path='/UserDashboard/*' element={<UserDashboard/>}/>
            <Route path="*" element={<Navigate to ="/UserDashboard" replace/>}/>
          </Routes>
        :
        <Routes>
          <Route path='/' element={<Homepage />} />
          <Route path="*" element={<Navigate to ="/" replace/>}/>
        </Routes>
      }
    </div>
  )
}

export default App;