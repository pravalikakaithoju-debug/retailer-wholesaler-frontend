import { useEffect, useState, useRef,useCallback } from 'react';
import API from '../services/api';

import './responsive.css';

function ChatPage() {

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [wholesalers, setWholesalers] = useState([]);
    const [, setRetailers] = useState([]);
    const [selectedChat, setSelectedChat] = useState('broadcast');
    const [currentRoomId, setCurrentRoomId] = useState(2);
    const [currentUser, setCurrentUser] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [rooms, setRooms] = useState([]);
    const [
    acceptedProducts,
    setAcceptedProducts
] = useState([]);
    
    const [searchUser, setSearchUser] =
    useState('');
   
    
    
    const socketRef = useRef(null);

    const connectWebSocket = useCallback((roomId) => {
        

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
    },[selectedChat] );

    useEffect(() => {

    fetchMessages(currentRoomId);

    if (currentRoomId) {

        connectWebSocket(currentRoomId);
    }

    return () => {

        if (socketRef.current) {

            socketRef.current.close();
        }
    };

}, [currentRoomId, connectWebSocket]);
useEffect(() => {

    if (
        currentRoomId
    ) {

        fetchAcceptedProducts();
    }

}, [
    currentRoomId
]);
    

    

    const fetchCurrentUser = async () => {

        try {

            const response = await API.get(
                'chat/current-user/'
            );


            

            console.log(
                'Current User:',
                response.data
            );
            setCurrentUser(response.data);

        } catch (error) {

            console.log(
                'Current User Error:',
                error
            );
        }
    };

    const fetchMessages = async (roomId) => {

    const response = await API.get(
        `chat/messages/${roomId}/`
    );

    console.log(
        "MESSAGES FROM API",
        response.data
    );

    setMessages(response.data);

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

        console.log(
    "Retailers Count:",
    response.data.length
);

console.log(
    JSON.stringify(
        response.data,
        null,
        2
    )
);

        setRetailers(response.data);

    } catch (error) {

        console.log(
            'Retailers Error:',
            error
        );
    }
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
    
};
    const deleteChat = async () => {

    if (
        !window.confirm(
            "Delete all messages in this chat?"
        )
    ) {
        return;
    }

    try {

        await API.delete(
            `chat/delete-chat/${currentRoomId}/`
        );

        fetchMessages(
            currentRoomId
        );

    } catch (error) {

        console.log(error);
    }
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

    const rejectRequest = async (
    messageId
) => {

    try {

        await API.post(
            `chat/reject-message/${messageId}/`,
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
            'Reject Error:',
            error
        );
    }
};
    const uploadAvatar = async (file) => {

    if (!file) return;

    const formData =
        new FormData();

    formData.append(
        'avatar',
        file
    );

    try {

        await API.post(
            'accounts/upload-avatar/',
            formData,
            {
                headers: {
                    'Content-Type':
                        'multipart/form-data'
                }
            }
        );

        alert(
            'Avatar Updated Successfully'
        );

        fetchCurrentUser();

    } catch (error) {

        console.log(error);

        alert(
            'Upload Failed'
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
console.log(
    JSON.stringify(
        response.data,
        null,
        2
    )
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
const fetchAcceptedProducts = async () => {

    try {

        const otherUser =
            rooms
                .find(
                    (r) =>
                        r.id ===
                        currentRoomId
                )
                ?.participants.find(
                    (p) =>
                        p.id !==
                        currentUser?.id
                );

        if (!otherUser) return;

        let retailerId;
        let wholesalerId;

        if (
            currentUser.role ===
            'retailer'
        ) {

            retailerId =
                currentUser.id;

            wholesalerId =
                otherUser.id;

        } else {

            retailerId =
                otherUser.id;

            wholesalerId =
                currentUser.id;
        }

        const res =
            await API.get(

                `chat/accepted-products/?retailer_id=${retailerId}&wholesaler_id=${wholesalerId}`

            );

        setAcceptedProducts(
            res.data
        );

    } catch (err) {

        console.log(
            err
        );
    }
};
    
    return (

        <div className="chat-container">

            <div className="sidebar">
                

                <h3>Chats</h3>
                <p>
    
    <b>
        <div
    style={{
        marginBottom: '15px'
    }}
>


    <strong>
        <div
    style={{
        textAlign: 'center',
        marginBottom: '20px'
    }}
>

    

    <strong>
        <div
    style={{
        textAlign: 'center',
        marginBottom: '20px'
    }}
>

    <label htmlFor="avatar-upload">

        <img
            src={
                currentUser?.avatar
                    ? `https://retailer-wholesaler-chat.onrender.com${currentUser.avatar}`
                    : 'https://via.placeholder.com/80'
            }
            alt="profile"
            style={{
                width:
    window.innerWidth < 768
        ? '60px'
        : '80px',

height:
    window.innerWidth < 768
        ? '60px'
        : '80px',
                borderRadius: '50%',
                objectFit: 'cover',
                cursor: 'pointer',
                border: '2px solid #ccc'
            }}
        />

    </label>

    <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        style={{
            display: 'none'
        }}
        onChange={(e) =>
            uploadAvatar(
                e.target.files[0]
            )
        }
    />

    <br />

    <strong>
        Logged in as:
        {' '}
        {currentUser?.username}
    </strong>

    <br />

    <small>
        ({currentUser?.role})
    </small>

</div>
    </strong>

 

</div>
        
    </strong>

</div>
    </b>
    
</p>


<button
    onClick={logout}
    style={{
    padding: '10px',
    width: '100%',
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
                <div
    style={{
        display: 'flex',
        alignItems: 'center',
        margin: '10px'
    }}
>

    <input
    type="text"
    style={{
        flex: 1,
        width: '100%',
        padding: '10px'
    }}
    placeholder={
        currentUser?.role === 'retailer'
            ? 'Search wholesalers...'
            : 'Search retailers...'
    }
    value={searchUser}
    onChange={(e) => {

        console.log(
            "Typing:",
            e.target.value
        );

        setSearchUser(
            e.target.value
        );
    }}
/>

    <button
        onClick={() =>
            setSearchUser('')
        }
        style={{
            marginLeft: '5px',
            cursor: 'pointer'
        }}
    >
        ✖
    </button>

</div>
               {
    currentUser?.role === 'retailer' &&

    wholesalers

    .filter((user) =>

        user.username
            .toLowerCase()
            .includes(
                searchUser.toLowerCase()
            )
    )

    .map(
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
            width:
    window.innerWidth < 768
        ? '60px'
        : '80px',

height:
    window.innerWidth < 768
        ? '60px'
        : '80px',
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

    .filter((room) => {

    const otherUser =
        room.participants.find(
            (p) =>
                p.id !== currentUser?.id
        );

    console.log(
        "Current User:",
        currentUser?.username
    );

    console.log(
        "Search Text:",
        searchUser
    );

    console.log(
        "Other User:",
        otherUser?.username
    );

    if (!otherUser) return false;

    return otherUser.username
        .toLowerCase()
        .includes(
            searchUser.toLowerCase()
        );
})
    .map((room) => {

    const retailer =
        room.participants.find(
            (p) =>
                p.id !== currentUser?.id
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

                    {retailer.is_online ? '🟢' : '🔴'} <div
    style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    }}
>

    <img
        src={
            retailer.avatar
                ? `https://retailer-wholesaler-chat.onrender.com${retailer.avatar}`
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

        {retailer.username}

        <br />

        <small
            style={{
                color:
                    retailer.is_online
                        ? 'green'
                        : 'gray'
            }}
        >
            {
                retailer.is_online
                    ? 'Online'
                    : 'Offline'
            }
        </small>

    </div>

</div>

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

            <div className="chat-area">

                <h2>

                    {
                        selectedChat ===
                        'broadcast'
                            ? 'Broadcast Chat Room'
                            : `Chat with ${selectedChat}`
                    }
                 

                </h2>
                <button
    onClick={deleteChat}
    style={{
        marginBottom: '10px',
        backgroundColor: 'blue',
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }}
>
    Delete Chat
</button>


   

   {
    selectedChat !== 'broadcast' &&
    acceptedProducts.length > 0 && (

        <div
            style={{
                marginBottom: '15px',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px'
            }}
        >

            <b>
                Accepted Products
            </b>

            <ul>

                {
                    acceptedProducts.map(
                        (product, index) => (

                            <li key={index}>
                                ✓ {product.product_name}
                            </li>

                        )
                    )
                }

            </ul>

        </div>

    )
}

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
        maxWidth:
    window.innerWidth < 768
        ? '90%'
        : '60%',

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
    width: '100%',
    maxWidth:
        window.innerWidth < 768
            ? '180px'
            : '250px',
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
    currentUser?.role === 'wholesaler' &&
    msg.status === 'pending' &&
    msg.sender.username !== currentUser?.username && (

        <div
            style={{
                marginTop: '10px'
            }}
        >

            {
                selectedChat === 'broadcast' ? (

                    <button
                        onClick={() =>
                            acceptRequest(msg.id)
                        }
                    >
                        Accept
                    </button>

                ) : (

                    <>
                        <button
                            onClick={() =>
                                acceptRequest(msg.id)
                            }
                        >
                            Accept
                        </button>

                        <button
                            onClick={() =>
                                rejectRequest(msg.id)
                            }
                            style={{
                                marginLeft: '10px'
                            }}
                        >
                            Reject
                        </button>
                    </>

                )
            }

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
    width: '100%',
    padding: '10px',
    boxSizing: 'border-box'
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