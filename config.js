export default function routeConfig(server, config) {
	server.get("/config", (_, response) => {
		response
			.status(200)
			.json(config.toJS())
			.end()
	})
}