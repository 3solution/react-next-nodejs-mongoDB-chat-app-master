/** @format */

// import logo from './logo.svg';
import React from 'react';

import './App.css';
import 'antd/dist/antd.css';
import LoginPage from './pages/login-page/login-page.component';
import ChatPage from './pages/chat-page/chat-page.component';

import { Switch, Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { selectCurrentUser } from './redux/user/user.selector';
import RegisterPage from './pages/register-page/register-page.component';
import RoomPage from './pages/room/room.pages';
import DragDropPage from './pages/dragdrop/dragdrop.pages';

class App extends React.Component {
    render() {
        const { currentUser } = this.props;

        return (
            <Switch>
                <Route
                    exact
                    path='/'
                    render={() => (currentUser ? <Redirect to='/chat'></Redirect> : <LoginPage />)}
                ></Route>
                <Route
                    exact
                    path='/annotation-rooms'
                    render={() => (currentUser ? <RoomPage /> : <Redirect to='/'></Redirect>)}
                ></Route>
                <Route
                    exact
                    path='/dragdrop'
                    render={() => (currentUser ? <DragDropPage /> : <Redirect to='/'></Redirect>)}
                ></Route>
                <Route
                    exact
                    path='/register'
                    render={() => (currentUser ? <Redirect to='/chat'></Redirect> : <RegisterPage />)}
                ></Route>
                <Route exact path='/chat' render={() => (currentUser ? <ChatPage /> : <Redirect to='/'></Redirect>)}></Route>
            </Switch>
        );
    }
}

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser,
});

export default connect(mapStateToProps)(App);
