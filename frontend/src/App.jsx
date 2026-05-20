import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import Home from './pages/Home'
import useGetCity from './hooks/useGetCity'
import useGetMyshop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemsByCity from './hooks/useGetItemsByCity'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { useEffect } from 'react'
import { io } from 'socket.io-client'

export const serverUrl="http://localhost:8000"

let socketInstance = null
export const getSocket = () => socketInstance

// Redirects to '/' if the user's role is not allowed
const RoleRoute = ({ element, allowedRoles }) => {
  const { userData } = useSelector(state => state.user)
  if (!userData) return <Navigate to="/signin" />
  if (!allowedRoles.includes(userData.role)) return <Navigate to="/" />
  return element
}

function App() {
    const {userData}=useSelector(state=>state.user)
    const dispatch=useDispatch()
  useGetCurrentUser()
useUpdateLocation()
  useGetCity()
  useGetMyshop()
  useGetShopByCity()
  useGetItemsByCity()
  useGetMyOrders()

  useEffect(()=>{
if (!socketInstance) {
  socketInstance=io(serverUrl,{ transports: ['polling'], withCredentials:true })
}
socketInstance.on('connect',()=>{
if(userData){
  socketInstance.emit('identity',{userId:userData._id})
}
})
return ()=>{
  if(socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
  },[userData?._id])

  return (
   <Routes>
    {/* Public routes — redirect to home if already logged in */}
    <Route path='/signup' element={!userData?<SignUp/>:<Navigate to={"/"}/>}/>
    <Route path='/signin' element={!userData?<SignIn/>:<Navigate to={"/"}/>}/>
    <Route path='/forgot-password' element={!userData?<ForgotPassword/>:<Navigate to={"/"}/>}/>

    {/* Common — any logged-in user */}
    <Route path='/' element={userData?<Home/>:<Navigate to={"/signin"}/>}/>

    {/* Owner only */}
    <Route path='/create-edit-shop' element={<RoleRoute element={<CreateEditShop/>} allowedRoles={["owner"]}/>}/>
    <Route path='/add-item' element={<RoleRoute element={<AddItem/>} allowedRoles={["owner"]}/>}/>
    <Route path='/edit-item/:itemId' element={<RoleRoute element={<EditItem/>} allowedRoles={["owner"]}/>}/>

    {/* User only */}
    <Route path='/cart' element={<RoleRoute element={<CartPage/>} allowedRoles={["user"]}/>}/>
    <Route path='/checkout' element={<RoleRoute element={<CheckOut/>} allowedRoles={["user"]}/>}/>
    <Route path='/order-placed' element={<RoleRoute element={<OrderPlaced/>} allowedRoles={["user"]}/>}/>
    <Route path='/track-order/:orderId' element={<RoleRoute element={<TrackOrderPage/>} allowedRoles={["user"]}/>}/>
    <Route path='/shop/:shopId' element={<RoleRoute element={<Shop/>} allowedRoles={["user"]}/>}/>

    {/* User + Owner */}
    <Route path='/my-orders' element={<RoleRoute element={<MyOrders/>} allowedRoles={["user","owner"]}/>}/>
   </Routes>
  )
}

export default App
