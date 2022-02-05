import React from 'react'
import {Provider, createStore, connect} from "./redux"

//初始化，从redux中规定的数据处理方法。
const reducer = (state,{type,payload})=>{
  if(type === 'updateUser'){
    return {
      ...state,
      user:{
        ...state.user,
        ...payload
      }
    }
  }else {
    return state
  }
}
const initState ={
  user:{name:'zdy',age:18},
  group:{name:'前端组'}
}
const store = createStore(reducer,initState)

export const App = () => {
  return (
    <Provider store={store}>
      <大儿子/>
      <二儿子/>
      <幺儿子/>
    </Provider>
  )
}
const 大儿子 = () => {
  console.log('大儿子执行了' + Math.random())
  return <section>大儿子<User/></section>
}
const 二儿子 = () => {
  console.log('2儿子执行了' + Math.random())
  return <section>二儿子<UserModifier/></section>
}
const 幺儿子 = connect(state => {
  return {group: state.group}
})(({group}) => {
  console.log('3儿子执行了' + Math.random())
  return <section>幺儿子
    <Action_func/>
    <div>group:{group.name}</div>
  </section>
})

const userSelector = state =>{
  return {user: state.user}
}
const userDispatcher = (dispatch)=> {
  return {
    updateUser: (attrs) => dispatch({type: 'updateUser', payload: attrs})
  }
}
const connectToUser = connect(userSelector,userDispatcher)

const User = connectToUser(({user}) => {
  return <div>User:{user.name}</div>
})

//传children
const UserModifier = connectToUser(({updateUser, user, children}) => {         //通过props来读写数据，redux-react库
  const onChange = (e) => {
    updateUser({name: e.target.value})
  }
  return <div>
    {children}
    <input value={user.name}
           onChange={onChange}/>
  </div>
})

const ajax = () => {
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve({data:{name:'2.5s后的zdy'}})
    },2500)
  })
}

const fetchUser = (dispatch)=>{
  ajax('/user').then(response=>{
    dispatch({type:'updateUser',payload:response.data})
  })
}

const fetchUsePromise =()=>{
  return ajax('/user').then(response=>response.data)
}

const Action_func = connect(null,null)(({state,dispatch})=>{
  console.log('Action_func执行了'+ Math.random())
  const onClick = ()=>{
    //dispatch(fetchUser)
    dispatch({type:'updateUser',payload:fetchUsePromise()})
  }
  return <div>
    <div>User:{state.user.name}</div>
    <button onClick={onClick}>异步获取user</button>
  </div>
})




