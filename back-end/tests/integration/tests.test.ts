/* eslint-disable no-undef */
import { prisma } from "../../src/database";
import app from "../../src/app";
import supertest from "supertest";
import { faker } from "@faker-js/faker";
import {
	recommendationBodyFactory,
	recommendationFactory,
	manyRecommendationsFactory,
	nthRecommendationsFactory,
} from "../factories/recomendationFactory";

describe("Testa: POST/recommendations", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera 422 se o nome tiver com tipo invalido", async () => {
		const body = recommendationBodyFactory("notStringName");

		const response = await supertest(app).post("/recommendations").send(body);

		expect(response.status).toBe(422);
	});

	it("Espera 422 de uma recomendação sem nome", async () => {
		const body = recommendationBodyFactory("missingName");

		const response = await supertest(app).post("/recommendations").send(body);

		expect(response.status).toBe(422);
	});

	it("Espera 422 se nao existr link ou tiver vazio", async () => {
		const body = recommendationBodyFactory("missingLink");

		const response = await supertest(app).post("/recommendations").send(body);

		expect(response.status).toBe(422);
	});

	it("Espera 422 se o link for invalido", async () => {
		const body = recommendationBodyFactory("wrongLink");

		const response = await supertest(app).post("/recommendations").send(body);

		expect(response.status).toBe(422);
	});

	it("Espera 201 se tiver sucesso", async () => {
		const body = recommendationBodyFactory("correct");

		const response = await supertest(app).post("/recommendations").send(body);

		const result = await prisma.recommendation.findUnique({
			where: {
				name: body.name,
			},
		});

		expect(response.status).toBe(201);
		expect(result.youtubeLink).toBe(body.youtubeLink);
	});
});

describe("Testa: POST/recommendations/upvote", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera retornar 200 e incrementar o contador em 1 ", async () => {
		const recommendation = await recommendationFactory();

		const resultBefore = await prisma.recommendation.findUnique({
			where: {
				id: recommendation.id,
			},
		});

		const response = await supertest(app)
			.post(`/recommendations/${recommendation.id}/upvote`)
			.send();

		const resultAfter = await prisma.recommendation.findUnique({
			where: {
				id: recommendation.id,
			},
		});

		expect(response.status).toBe(200);
		expect(resultAfter.score - resultBefore.score).toBe(1);
	});
});

describe("Teste: POST/recommendations/downvote", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera retornar 200 e diminuir o contador em 1 ", async () => {
		const recommendation = await recommendationFactory();

		const resultBefore = await prisma.recommendation.findUnique({
			where: {
				id: recommendation.id,
			},
		});

		const response = await supertest(app)
			.post(`/recommendations/${recommendation.id}/downvote`)
			.send();

		const resultAfter = await prisma.recommendation.findUnique({
			where: {
				id: recommendation.id,
			},
		});

		expect(response.status).toBe(200);
		expect(resultAfter.score - resultBefore.score).toBe(-1);
	});
});

describe("Testa: GET/recommendations/", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera retornar 200 e persistir uma solicitação válida", async () => {
		await nthRecommendationsFactory(20);
		const response = await supertest(app).get("/recommendations");

		expect(response.status).toBe(200);
		expect(response.body.length).toBeLessThanOrEqual(10);
	});
});

describe("Testa: GET/recommendations/:id", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera retornar uma recomendação dada um id", async () => {
		const recommendation = await recommendationFactory();

		const response = await supertest(app).get(
			`/recommendations/${recommendation.id}`
		);

		expect(response.status).toBe(200);
		expect(response.body.id).toBe(recommendation.id);
	});
});

describe("Testa: GET/recommendations/random", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Deve retornar uma recomendação", async () => {
		await manyRecommendationsFactory();

		const response = await supertest(app).get("/recommendations/random");

		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty("id");
	});
});

describe("Testa: GET/recommendations/top/:amount", () => {
	beforeEach(truncateTables);

	afterAll(disconnect);

	it("Espera retornar uma lista de X recomendações, ordenadas por pontuação, dada a quantidade X", async () => {
		await manyRecommendationsFactory();

		const amount = faker.datatype.number({ min: 2, max: 4 });

		const response = await supertest(app).get(`/recommendations/top/${amount}`);

		expect(response.status).toBe(200);
		expect(response.body.length).toBe(amount);
		expect(response.body[0].score).toBeGreaterThanOrEqual(
			response.body[1].score
		);
	});
});

async function disconnect() {
	await prisma.$disconnect();
}

async function truncateTables() {
	await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
}
