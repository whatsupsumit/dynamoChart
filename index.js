const aws = require("aws-sdk");
const dotenv = require("dotenv");
const express = require("express");
const path = require("path");

dotenv.config();
const app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.AWS_REGION;

const dynamoDb = new aws.DynamoDB.DocumentClient({
	accessKeyId,
	secretAccessKey,
	region,
});

function getItems() {
	const params = {
		TableName: "VirtualIotTable",
	};

	return dynamoDb.scan(params).promise();
}

function processData(data) {
	const chartData = {
		labels: [],
		datasets: [
			{
				label: "CPU",
				data: [],
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				borderColor: "rgba(255, 99, 132, 1)",
				borderWidth: 1,
			},
			{
				label: "Memory",
				data: [],
				backgroundColor: "rgba(54, 162, 235, 0.2)",
				borderColor: "rgba(54, 162, 235, 1)",
				borderWidth: 1,
			},
		],
	};

	data.Items.forEach((item) => {
		chartData.labels.push(item.time);
		chartData.datasets[0].data.push(item.cpu);
		chartData.datasets[1].data.push(item.memory);
	});

	return chartData;
}

app.get("/", async (req, res) => {
	try {
		const data = await getItems();
		const chartData = processData(data);

		res.render("index", { data: chartData });
	} catch (error) {
		console.error(error);
		res.status(500).send("Internal Server Error");
	}
});

app.listen(3000, () => {
	console.log("Server is running on port 3000");
});