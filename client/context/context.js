import { createContext, useState, useEffect, useReducer } from "react";
import { useRouter } from "next/router";
import Gun from "gun";

export const DiscordContext = createContext();

const gun = Gun({
  peers: ["https://discord-app-blockchain-1.herokuapp.com/gun"],
});

const initialState = { messages: [] };

const reducer = (state, action) => {
  try {
    if (action.type == "clear") return { messages: [] };
    if (action.type == "add")
      return { messages: [...state.messages, action.data] };
  } catch (error) {
    console.error(error);
  }
};

export const DiscordProvider = ({ children }) => {
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentAccount, setCurrentAccount] = useState("");
  const [roomName, setRoomName] = useState("");
  const [placeholder, setPlaceholder] = useState("Message...");
  const [messageText, setMessageText] = useState("");
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [currentAccount]);

  //for get current User Data
  useEffect(async () => {
    if (!currentAccount) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/getCurrentUserData?accountAddress=${currentAccount}`
      );

      const data = await response.json();
      setCurrentUser(data);
    } catch (error) {
      console.error(error);
    }
  }, [currentAccount]);

  //dynamic to change room name and placeholder
  useEffect(() => {
    setRoomName(router.query.name);
    dispatch({ type: "clear", data: {} });
    setPlaceholder(`Message ${router.query.name}`);
    setMessageText("");
    getMessages();
  }, [router.query]);

  //get messages
  const getMessages = () => {
    const _name = router.query.name;
    const _roomId = router.query.id;
    const messagesRef = gun.get(_name);

    messagesRef.map().once((message) => {
      dispatch({
        type: "add",
        data: {
          sender: message.sender,
          content: message.content,
          avatar: message.avatar,
          createdAt: message.createdAt,
          messageId: message.messageId,
        },
      });
    });
  };

  //create user
  const createUserAccount = async (userAddress) => {
    if (!window.ethereum) return;

    try {
      const data = {
        userAddress: userAddress,
      };
      // console.log(userAddress);
      //create account
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createuser`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.log(error);
      }

      //   create direct message
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/createdm`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.error(error);
    }
  };

  //check if user is connected
  const checkIfWalletIsConnected = async () => {
    if (!window.ethereum) return;
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressArray.length > 0) {
        setCurrentAccount(addressArray[0]);
        createUserAccount(addressArray[0]);
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  //connect wallet function
  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      if (addressArray.length > 0) {
        setCurrentAccount(addressArray[0]);
        createUserAccount(addressArray[0]);
      } else {
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DiscordContext.Provider
      value={{
        currentAccount,
        roomName,
        setRoomName,
        placeholder,
        messageText,
        setMessageText,
        state,
        gun,
        connectWallet,
        currentUser,
      }}
    >
      {children}
    </DiscordContext.Provider>
  );
};
