"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "./swagger-dark.css";

export default function ApiDoc() {
	return <SwaggerUI url="/api/doc" />;
}
