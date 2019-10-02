import React from 'react';
import './App.css';
import ChatBot, { Loading } from 'react-simple-chatbot';
import { message } from 'antd';
import 'antd/dist/antd.css';

class App extends React.Component {
	state = {
		steps: [
			{
				id: '1',
				component: <InitialMessage />,
				waitAction: true,
				asMessage: true,
				trigger: 'userInput',
			},
			{
				id: 'userInput',
				user: true,
				trigger: '3',
			},
			{
				id: '3',
				component: <ChatBotMessage />,
				waitAction: true,
				asMessage: true,
				trigger: 'userInput',
			},
		],
	};

	render() {
		return (
			<div className="App">
				<ChatBot recognitionEnable={true} steps={this.state.steps} />
			</div>
		);
	}
}

class ChatBotMessage extends React.Component {
	state = {};
	componentDidMount() {
		this.fetchNextMessage(this.props.steps.userInput.value);
	}
	fetchNextMessage = async (input) => {
		try {
			const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
				method: 'POST',
				body: JSON.stringify({
					sender: 'Me',
					message: input,
				}),
			});
			if (response.ok) {
				const [ data ] = await response.json();
				console.log(data);
				this.setState({ message: data.text });
				this.props.triggerNextStep();
				return;
			} else {
				message.error('Unable to fetch message');
			}
		} catch (e) {
			message.error('Unable to fetch message');
			console.error(e);
		}
		this.setState({ message: 'Unable to fetch message' });
		this.props.triggerNextStep();
	};

	render() {
		const { message } = this.state;
		return <span>{message || <Loading />}</span>;
	}
}
class InitialMessage extends React.Component {
	state = {};

	async componentDidMount() {
		try {
			const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
				method: 'POST',
				body: JSON.stringify({
					sender: 'Me',
					message: 'Hello!',
				}),
			});
			if (response.ok) {
				const [ data ] = await response.json();
				this.setState({ message: data.text }, () => {
					this.props.triggerNextStep();
				});
				return;
			}
		} catch (e) {
			console.error(e);
		}
		this.setState({ message: 'Hello! Welcome to the Cognite Chatbot!' }, () => {
			this.props.triggerNextStep();
		});
		return;
	}

	render() {
		const { message } = this.state;
		return <span>{message || <Loading />}</span>;
	}
}

export default App;
