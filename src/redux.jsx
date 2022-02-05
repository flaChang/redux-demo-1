//高阶组件：接受一个组件，返回一个组件
import React, {useEffect, useState} from "react"

let state = undefined
let reducer = undefined
let listener = []
const setState = (newState) => {
  state = newState
  listener.map(fn => fn(state))
}

const store = {
  getState() {
    return state
  },
  dispatch: (action) => {            //规范setState流程
    setState(reducer(state, action))
  },
  subscribe(fn) {
    listener.push(fn)
    return () => {
      listener.splice(listener.indexOf(fn), 1)
    }
  }
}
let dispatch = store.dispatch
//方便用户将初始化状态以及reducer传到 redux 里面
const preDispatch = dispatch

dispatch = (action) => {                        //dispatch支持函数action
  if (action instanceof Function) {
    action(dispatch)
  } else {
    preDispatch(action)
  }
}

const prevDispatch2 = dispatch

dispatch = (action) => {                       //dispatch支持promise action
  if (action.payload instanceof Promise) {
    action.payload.then(data => {
      dispatch({...action, payload: data})
    })
  } else {
    prevDispatch2(action)
  }
}

export const createStore = (_reducer, initState) => {
  state = initState
  reducer = _reducer
  return store
}

//connect支持selector，快速获取需要的数据
const changed = (oldState, newState) => {
  let changed = false
  for (let key in oldState) {
    if (oldState[key] !== newState[key]) {
      changed = true
    }
  }
  return changed
}
//connect 封装读和写，再传入一个组件即可，相当于将读写接口传入组件
export const connect = (selector, mapDispatchToProps) => (Component) => {       //connect高阶组件，将组件与全局状态连接起来
  return (props) => {            //dispatch方法要在包着组件的wrapper中使用，才能在全局读写state
    //获取读写接口
    const [, update] = useState({})  //保证被connect的组件被刷新
    //封装，拿到具体的数据。
    const data = selector ? selector(state) : {state}
    const dispatcher = mapDispatchToProps ? mapDispatchToProps(dispatch) : {dispatch}
    //一次调用，订阅查看是否更新。（在恰当的时候进行更新）
    useEffect(() => store.subscribe(() => {
      const newData = selector ? selector(state) : {state}
      if (changed(data, newData)) {
        update({})
      }
    }), [selector])
    //传props，将数据渲染到组件。
    return <Component {...props} {...data} {...dispatcher}/>  //通过props将dispatch传出来
  }
}
export const appContext = React.createContext(null)

export const Provider = ({store, children}) => {
  return (
    <appContext.Provider value={store}>
      {children}
    </appContext.Provider>
  )
}