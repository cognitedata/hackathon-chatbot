import React from 'react';
import './App.css';
import ChatBot from 'react-simple-chatbot';

const steps = [
	{
		id: '0',
		message: 'Welcome to Cognite chatbot!',
		trigger: '1',
	},
	{
		id: '1',
		user: true,
	},
];

function App() {
	return (
		<div className="App">
			<ChatBot recognitionEnable={true} steps={steps} />
		</div>
	);
}

export default App;
