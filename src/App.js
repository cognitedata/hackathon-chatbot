import React from 'react';
import './App.css';
import CogniteLogo from './cognite.svg';
import ChatBot, { Loading } from 'react-simple-chatbot';
import { message } from 'antd';
import 'antd/dist/antd.css';
import { ThemeProvider } from 'styled-components';

String.prototype.linkify = function() {
	// http://, https://, ftp://
	var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

	// www. sans http:// or https://
	var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

	// Email addresses
	var emailAddressPattern = /[\w.]+@[a-zA-Z_-]+?(?:\.[a-zA-Z]{2,6})+/gim;

	return this.replace(urlPattern, '<a _target="_blank" href="$&">$&</a>')
		.replace(pseudoUrlPattern, '$1<a _target="_blank" href="http://$2">$2</a>')
		.replace(emailAddressPattern, '<a _target="_blank" href="mailto:$&">$&</a>');
};

const theme = {
	background: '#fff',
	fontFamily: 'Helvetica Neue',
	headerBgColor: '#4A67FB',
	headerFontColor: '#fff',
	headerFontSize: '15px',
	botBubbleColor: '#4A67FB',
	botFontColor: '#fff',
	userBubbleColor: '#fff',
	userFontColor: '#4a4a4a',
};

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
				<ThemeProvider theme={theme}>
					<ChatBot
						botAvatar={CogniteLogo}
						recognitionEnable={true}
						steps={this.state.steps}
						headerTitle="Cognite Chatbot"
					/>
				</ThemeProvider>
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
			if (input.toLowerCase().indexOf('hello') > -1) {
				await fetch('http://localhost:5005/webhooks/rest/webhook', {
					method: 'POST',
					body: JSON.stringify({
						sender: 'Me',
						message: '/restart',
					}),
				});
			}
			if (response.ok) {
				const data = await response.json();
				console.log(data);
				this.setState({
					message: (
						<p
							dangerouslySetInnerHTML={{
								__html: data.reduce((prev, el) => `${prev}\n${el.text}`, '').linkify().replace(/\n/g, '<br />'),
							}}
						/>
					),
				});
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
		return message ? <span dangerouslySetInnerHTML={{ __html: message.replace(/\n/g, '<br />') }} /> : <Loading />;
	}
}

export default App;
