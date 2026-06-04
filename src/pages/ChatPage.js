import { useEffect, useState, useRef } from 'react';
import API from '../services/api';

function ChatPage() {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [wholesalers, setWholesalers] = useState([]);
    const [retailers, setRetailers] = useState([]);
    const [selectedChat, setSelectedChat] = useState('broadcast');
    const [currentRoomId, setCurrentRoomId] = useState(2);
    const [currentUser, setCurrentUser] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [rooms, setRooms] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
         console.log(
        "Current Room:",
        currentRoomId
        );

        fetchCurrentUser();
        fetchMessages(currentRoomId);
        fetchWholesalers();
        fetchRooms();
        fetchRetailers();
        connectWebSocket(currentRoomId);
        


        return () => {

            if (socketRef.current) {

                socketRef.current.close();
            }
        };

    }, [currentRoomId]);

    const fetchCurrentUser = async () => {

        try {

            const response = await API.get(
                'chat/current-user/'
            );

            setCurrentUser(response.data);

            console.log(
                'Current User:',
                response.data
            );

        } catch (error) {

            console.log(
                'Current User Error:',
                error
            );
        }
    };

    const fetchMessages = async (roomId) => {

        try {

            const response = await API.get(
                `chat/messages/${roomId}/`
            );

            setMessages(response.data);

        } catch (error) {

            console.log(
                'Messages Error:',
                error
            );
        }
    };

    const fetchWholesalers = async () => {

        try {

            const response = await API.get(
                'chat/wholesalers/'
            );

            setWholesalers(response.data);

        } catch (error) {

            console.log(
                'Wholesalers Error:',
                error
            );
        }
    };
    const fetchRetailers = async () => {

    try {

        const response = await API.get(
            'chat/retailers/'
        );

        setRetailers(response.data);

    } catch (error) {

        console.log(
            'Retailers Error:',
            error
        );
    }
    };

    const connectWebSocket = (roomId) => {

        if (socketRef.current) {

            socketRef.current.close();
        }

        socketRef.current = new WebSocket(
            `wss://retailer-wholesaler-chat.onrender.com/ws/chat/${roomId}/`
        );

        socketRef.current.onopen = () => {

            console.log(
                'WebSocket Connected'
            );
        };

        socketRef.current.onmessage = (event) => {

            const data = JSON.parse(
                event.data
            );

            const newMsg = {

    id: data.message_id,

    sender: {
        username: data.sender
    },

    content: data.message,

    status: 'open',

    created_at:
        new Date().toISOString()
};

            setMessages((prev) => {

    const exists = prev.some(
        (msg) =>
            msg.id === newMsg.id
    );

    if (exists) {
        return prev;
    }

    return [...prev, newMsg];
});

if (selectedChat !== 'broadcast') {

    setUnreadCounts((prev) => ({

        ...prev,

        [data.sender]:
            (prev[data.sender] || 0) + 1
    }));
}
        };

        socketRef.current.onclose = () => {

            console.log(
                'WebSocket Closed'
            );
        };
    };

const sendMessage = async () => {

    if (!currentUser) return;

    // Upload image if selected
    if (selectedImage) {

        const formData = new FormData();

        formData.append(
            'image',
            selectedImage
        );

        formData.append(
            'room_id',
            currentRoomId
        );

        formData.append(
            'sender_id',
            currentUser.id
        );
        formData.append(
    'content',
    newMessage
);
        try {

            await API.post(
                'chat/upload-image/',
                formData,
                {
                    headers: {
                        'Content-Type':
                            'multipart/form-data'
                    }
                }
            );

            setSelectedImage(null);
setNewMessage('');

fetchMessages(currentRoomId);

return;

        } catch (error) {

            console.log(
                'Image Upload Error:',
                error
            );

            return;
        }
    }

    // Send text message
    if (
        newMessage &&
        socketRef.current &&
        socketRef.current.readyState ===
        WebSocket.OPEN
    ) {

        socketRef.current.send(
            JSON.stringify({

                message: newMessage,

                sender_id:
                    currentUser.id
            })
        );

        setNewMessage('');
    }

    // Refresh messages
    fetchMessages(
        currentRoomId
    );
};


    const acceptRequest = async (
        messageId
    ) => {

        try {

            await API.post(
                `chat/accept-message/${messageId}/`,
                {
                    wholesaler_id:
                        currentUser?.id
                }
            );

            fetchMessages(
                currentRoomId
            );

        } catch (error) {

            console.log(
                'Accept Error:',
                error
            );
        }
    };

    const openDirectChat = async (
        wholesaler
    ) => {

        if (!currentUser) return;

        try {

            const response =
                await API.post(
                    'chat/create-direct-room/',
                    {
                        retailer_id:
                            currentUser.id,

                        wholesaler_id:
                            wholesaler.id
                    }
                );

            const room =
                response.data;

            setCurrentRoomId(
                room.id
            );

            setSelectedChat(
                wholesaler.username
            );

        } catch (error) {

            console.log(
                'Direct Room Error:',
                error
            );
        }
    };

    const fetchRooms = async () => {

    try {

        const response =
            await API.get(
                'chat/rooms/'
            );

        setRooms(
    response.data
);

console.log(
    'Rooms Loaded:',
    response.data
);

    } catch (error) {

        console.log(
            'Rooms Error:',
            error
        );
    }
};
    console.log("Rooms:", rooms);
const logout = async () => {

    try {

        await API.post(
            'chat/logout/'
        );

    } catch (error) {

        console.log(
            'Logout Error:',
            error
        );
    }

   localStorage.removeItem(
    'access'
);

localStorage.removeItem(
    'refresh'
);

    window.location.reload();
};
    return (

        <div
            style={{
                display: 'flex',
                height: '100vh'
            }}
        >

            <div
                style={{
                    width: '250px',
                    borderRight:
                        '1px solid gray',
                    padding: '20px'
                }}
            >

                <h3>Chats</h3>
                <p>
    Logged in as:
    {' '}
    <b>
        {currentUser?.username}
    </b>
    {' '}
    (
    {currentUser?.role}
    )
</p>

<button
    onClick={logout}
    style={{
        padding: '8px',
        marginBottom: '15px',
        cursor: 'pointer'
    }}
>
    Logout
</button>

                <div
                    onClick={() => {

                        setSelectedChat(
    'broadcast'
);

setUnreadCounts((prev) => ({

    ...prev,

    broadcast: 0
}));

                        setCurrentRoomId(
                            2
                        );
                    }}
                    style={{
                        padding: '10px',
                        cursor: 'pointer',
                        backgroundColor:
                            selectedChat ===
                            'broadcast'
                                ? '#ddd'
                                : 'white',
                        borderRadius:
                            '8px',
                        marginBottom:
                            '10px'
                    }}
                >

                    Broadcast Chat

                      {
                          unreadCounts.broadcast > 0 &&
                          ` (${unreadCounts.broadcast})`
                      }

                </div>

               {
    currentUser?.role === 'retailer' &&

    wholesalers.map(
        (user) => (

            <div
                key={user.id}

                onClick={() =>
                    openDirectChat(user)
                }

                style={{
                    padding: '10px',
                    cursor: 'pointer',

                    backgroundColor:
                        selectedChat ===
                        user.username
                            ? '#ddd'
                            : 'white',

                    borderRadius: '8px',

                    marginBottom: '10px'
                }}
            >

           <img
        src={
            user.avatar
                ? `https://retailer-wholesaler-chat.onrender.com${user.avatar}`
                : 'https://via.placeholder.com/40'
        }
        alt="avatar"
        style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover'
        }}
    />

    <div>

        {user.is_online ? '🟢' : '🔴'}
        {' '}
        {user.username}

        {
            !user.is_online &&
            user.last_seen && (

                <div
                    style={{
                        fontSize: '12px',
                        color: 'gray'
                    }}
                >
                    Last seen:
                    {' '}
                    {
                        new Date(
                            user.last_seen
                        ).toLocaleString()
                    }
                </div>
            )
        }

    </div>

</div>
        )
    )
    
}

{
    currentUser?.role === 'wholesaler' &&

    rooms
        .filter(
            (room) =>
                room.room_type === 'direct'
        )
        .map((room) => {

            const retailer =
                room.participants.find(
                    (p) =>
                        p.role === 'retailer'
                );

            if (!retailer) return null;

            return (

                <div
                    key={room.id}

                    onClick={() => {

    setCurrentRoomId(
        room.id
    );

    setSelectedChat(
        retailer.username
    );

    setUnreadCounts((prev) => ({

        ...prev,

        [retailer.username]: 0
    }));
}}

                    style={{
                        padding: '10px',
                        cursor: 'pointer',

                        backgroundColor:
                            selectedChat ===
                            retailer.username
                                ? '#ddd'
                                : 'white',

                        borderRadius: '8px',

                        marginBottom: '10px'
                    }}
                >

                    {retailer.is_online ? '🟢' : '🔴'} {retailer.username}

{
    unreadCounts[
        retailer.username
    ] > 0 &&

    ` (${unreadCounts[
        retailer.username
    ]})`
}

                </div>
            );
        })
}
            </div>

            <div
                style={{
                    flex: 1,
                    padding: '20px'
                }}
            >

                <h2>

                    {
                        selectedChat ===
                        'broadcast'
                            ? 'Broadcast Chat Room'
                            : `Chat with ${selectedChat}`
                    }

                </h2>

                {
                    messages.map(
                        (msg) => (

                            <div
    key={msg.id}
    style={{
        display: 'flex',

        justifyContent:
            msg.sender.username ===
            currentUser?.username
                ? 'flex-end'
                : 'flex-start',

        marginBottom: '10px'
    }}
>
<div
    style={{
        maxWidth: '60%',

        border: '1px solid gray',

        padding: '10px',

        borderRadius: '10px',

        backgroundColor:
            msg.sender.username ===
            currentUser?.username
                ? '#DCF8C6'
                : '#FFFFFF'
    }}
>

                                <h4>
    {msg.sender.username}
</h4>

<p>
    {msg.content}
</p>
{
    msg.image && (

        <img
            src={
                `https://retailer-wholesaler-chat.onrender.com${msg.image}`
            }
            alt="chat"
            style={{
                maxWidth: '250px',
                maxHeight: '250px',
                borderRadius: '10px',
                marginTop: '10px'
            }}
        />

    )
}

<small>

    {
        msg.created_at
            ? new Date(
                  msg.created_at
              ).toLocaleString()
            : ''
    }

</small>

<br />

<small>

    Status:
    {' '}

    {
        msg.status === 'accepted'
            ? `accepted by ${msg.accepted_by?.username}`
            : msg.status
    }

</small>
   {
    selectedChat === 'broadcast' &&
    currentUser?.role === 'wholesaler' &&
    msg.status === 'open' &&
    msg.sender.username !== currentUser?.username && (

        <div>
            <button
                onClick={() =>
                    acceptRequest(msg.id)
                }
            >
                Accept
            </button>
        </div>
    )
}  
</div>
</div>
                        )
                    )
                }

                <div
                    style={{
                        display: 'flex',
                        marginTop:
                            '20px',
                        gap: '10px'
                    }}
                >
                    <input
    type="file"

    accept="image/*"

    onChange={(e) =>

        setSelectedImage(
            e.target.files[0]
        )
    }
/>

                    <input
                        type="text"
                        value={
                            newMessage
                        }
                        placeholder="Type message..."
                        onChange={(e) =>
                            setNewMessage(
                                e.target.value
                            )
                        }
                        style={{
                            flex: 1,
                            padding:
                                '10px'
                        }}
                    />

                    <button
                        onClick={sendMessage}
                    >

                        Send

                    </button>
                    

                </div>

            </div>

        </div>
    );
}


export default ChatPage;