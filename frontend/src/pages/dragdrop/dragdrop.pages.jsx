/** @format */

import React, { Component } from 'react';
import './dragdrop.styles.scss';

import { Modal, Input, Space } from 'antd';

import { AppstoreOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';

import { setCurrentUser } from '../../redux/user/user.actions';
import { createStructuredSelector } from 'reselect';
import { selectCurrentUser } from '../../redux/user/user.selector';

import { apiUrl, socketUrl } from '../../config/config.json';

import { io } from 'socket.io-client';

let socket;
// const roomName = window.localStorage.getItem('roomName');

class DragDropPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tasks: [
                {
                    key: 'label',
                    positionx: null,
                    positiony: null,
                },
            ],
            placed: [],
            counter: 0,
            modalVisible: false,
            modalName: '',
            tempEvent: null,
            draggedDivId: '',
            draggedDivRepeat: '',
            toShowModal: false,
            modalX: '',
            modalY: '',
            roomName: null,
            roomId: null,
            room: null,
        };
    }

    // When component mounts, retrieve the previous stored redux data and set the state
    componentDidMount = () => {
        const roomId = window.localStorage.getItem('currentRoomId');
        const roomName = window.localStorage.getItem('roomName');

        const { currentUser } = this.props;

        socket = io(socketUrl, { query: `roomName=${roomName}&token=${currentUser.tokens.access.token}` });
        socket.on('receive_state', data => {
            if (data.userId !== currentUser.user.name) {
                delete data.userName;
                delete data.roomName;
                this.setState({
                    ...data,
                });
            }
        });

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser.tokens.access.token}`,
        };

        fetch(apiUrl + `/rooms/manage/${roomId}`, { headers })
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                }

                let placed = [];
                if (data.placed.length > 0) {
                    placed = [...data.placed];
                }

                this.setState({
                    roomName,
                    roomId,
                    placed,
                    room: data,
                    counter: data.counter,
                    userId: currentUser.user.id,
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                console.error('Error!: ', error);
            });
    };

    // Function to show modal
    showModal = e => {
        const { toShowModal, draggedDivRepeat } = this.state;
        const modalVisible = toShowModal ? true : false;
        const modalX = e.pageX;
        const modalY = e.pageY;

        this.setState(
            {
                tempEvent: e,
                modalVisible,
                modalX,
                modalY,
            },
            () => {
                if (draggedDivRepeat) {
                    this.onDrop(e, 'complete');
                }
            }
        );
    };

    // Handle 'OK' click of modal
    handleOk = () => {
        const { modalName, tempEvent } = this.state;

        if (modalName.trim() !== '') {
            this.setState(
                {
                    modalVisible: false,
                    modalName,
                    tempEvent: null,
                },
                () => {
                    this.onDrop(tempEvent, 'complete');
                }
            );
        } else {
            alert('Please fill in all the details');
        }
    };

    // Handle closing of modal
    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    };

    // Handling the start action of dragging an element
    // The variable 'repeat' indicates if a new component is being added or
    // if the same component is being dragged to a new place.
    onDragStart = (ev, id, repeat = false) => {
        const toShowModal = repeat ? false : true;

        if (repeat) {
            ev.dataTransfer.setData('id', id);
            ev.dataTransfer.setData('repeat', repeat);
        }

        this.setState({
            draggedDivId: id,
            draggedDivRepeat: repeat,
            toShowModal,
        });
    };

    // Handling dragging of the component over draggable area
    onDragOver = ev => {
        ev.preventDefault();
    };

    // Handle input typing of modal inputs
    handleChange = event => {
        const { value, name } = event.target;

        this.setState({ [name]: value });
    };

    // Handling of dropping event. This function also updates the state
    // when a component is being dropped
    onDrop = (ev, cat) => {
        let repeat, id;

        if (ev.dataTransfer.getData('repeat')) {
            repeat = ev.dataTransfer.getData('repeat') === 'true' ? true : false;
            id = ev.dataTransfer.getData('id');
        } else {
            repeat = this.state.draggedDivRepeat;
            id = this.state.draggedDivId;
        }

        let placed = null;
        let { counter, modalName, roomName, roomId, room } = this.state;
        const { currentUser } = this.props;
        counter++;

        if (cat === 'complete' && !repeat) {
            placed = this.state.tasks;
            placed = placed.find(task => task.key === id);
            placed = JSON.parse(JSON.stringify(placed));
            placed.key = placed.key + '-' + counter;
            placed.category = cat;
            placed.selected = false;
            placed.positionx = ev.pageX;
            placed.positiony = ev.pageY;
            placed.name = modalName;
            const prevPlaced = this.state.placed;
            placed = [placed, ...prevPlaced];
        }

        if (repeat) {
            let prevPlaced = this.state.placed;
            placed = prevPlaced.find(task => task.key === id);
            placed.category = cat;
            placed.positionx = ev.pageX;
            placed.positiony = ev.pageY;
            placed = [...prevPlaced];
        }

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${currentUser.tokens.access.token}`,
            },
            body: JSON.stringify({
                name: roomName,
                userlist: room.userlist,
                createdBy: room.createdBy,
                placed,
                counter,
            }),
        };

        fetch(apiUrl + `/rooms/manage/${roomId}`, requestOptions)
            .then(async response => {
                const data = await response.json();

                if (!response.ok) {
                    const error = (data && data.message) || response.status;
                    return Promise.reject(error);
                }
                
                this.setState({
                    placed,
                    counter,
                    toShowModal: false,
                    modalName: '',
                }, () => {
                    const savedState = this.state;
                    delete savedState.tempEvent;
                    socket.emit('send_state', savedState);
                });
            })
            .catch(error => {
                this.setState({ errorMessage: error.toString() });
                console.error('Error!: ', error);

            });
            return true;
    };

    // Handle selecting elements
    handleClick = key => {
        const { placed } = this.state;

        const newPlaced = placed.filter(pl => {
            if (pl.key === key) {
                pl.selected = !pl.selected;
            }

            return pl;
        });

        this.setState({
            placed: newPlaced,
        });
    };

    // Handle deletion of elements
    handleDelete = e => {
        if (String(e.key) === 'Delete') {
            const { placed, roomName, room, roomId, counter } = this.state;
            const { currentUser } = this.props;

            const newPlaced = placed.filter(pl => {
                if (!pl.selected) {
                    return pl;
                }
                return null;
            });

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.tokens.access.token}`,
                },
                body: JSON.stringify({
                    name: roomName,
                    userlist: room.userlist,
                    createdBy: room.createdBy,
                    placed: newPlaced,
                    counter,
                }),
            };

            fetch(apiUrl + `/rooms/manage/${roomId}`, requestOptions)
                .then(async response => {
                    const data = await response.json();

                    if (!response.ok) {
                        const error = (data && data.message) || response.status;
                        return Promise.reject(error);
                    }

                    this.setState(
                        {
                            placed: newPlaced,
                        },
                        () => {
                            const savedState = this.state;
                            socket.emit('send_state', savedState);
                        }
                    );
                })
                .catch(error => {
                    this.setState({ errorMessage: error.toString() });
                    alert('Error!: ', error);
                });
        }
    };

    render() {
        const tasks = {
            complete: [],
        };

        const { modalX, modalY, modalName } = this.state;

        // Load previously placed elements
        if (this.state.placed.length > 0) {
            this.state.placed.forEach(t => {
                tasks['complete'].push(
                    <div
                        key={t.key}
                        onDragStart={e => this.onDragStart(e, t.key, true)}
                        draggable
                        className={t.selected ? 'draggable selected' : 'draggable'}
                        onClick={() => {
                            this.handleClick(t.key);
                        }}
                        style={{
                            position: 'absolute',
                            top: t.positiony - 50 + 'px',
                            left: t.positionx - 160 + 'px',
                            fontSize: t.fontSize + 'px',
                            fontWeight: t.fontWeight,
                        }}
                    >
                        {t.name}
                    </div>
                );
            });
        }

        // const { setCurrentSavedState } = this.props;
        // const { socket } = this.state;

        // Actual page rendering
        return (
            <div className='drag-drop-page' onKeyDown={e => this.handleDelete(e)} tabIndex='0'>
                <div className='container-drag'>
                    <div className='droppable' onDragOver={e => this.onDragOver(e)} onDrop={e => this.showModal(e)}>
                        {tasks.complete}
                    </div>
                    <div
                        className='wip'
                        onDragOver={e => this.onDragOver(e)}
                        onDrop={e => {
                            this.onDrop(e, 'wip');
                        }}
                    >
                        <h2>Annotations</h2>
                        <div onDragStart={e => this.onDragStart(e, 'label')} draggable className='draggable'>
                            <AppstoreOutlined style={{ marginRight: 8, color: '#D4D4D4' }} />
                            Label
                        </div>
                    </div>
                </div>
                <Modal
                    title='Edit Label'
                    visible={this.state.modalVisible}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                >
                    <Space direction='vertical' style={{ width: '100%' }}>
                        Text
                        <Input
                            type='text'
                            placeholder='Enter text to be displayed inside element'
                            name='modalName'
                            value={modalName}
                            onChange={this.handleChange}
                        />
                        X
                        <Input type='text' value={modalX + 'px'} disabled />
                        Y
                        <Input type='text' value={modalY + 'px'} disabled />
                    </Space>
                </Modal>
            </div>
        );
    }
}

const mapDispatchToProps = dispatch => {
    return {
        setCurrentUser: user => {
            dispatch(setCurrentUser(user));
        },
    };
};

const mapStateToProps = createStructuredSelector({
    currentUser: selectCurrentUser,
});

export default connect(mapStateToProps, mapDispatchToProps)(DragDropPage);
