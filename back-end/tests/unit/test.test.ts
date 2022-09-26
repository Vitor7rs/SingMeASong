import { recommendationService } from "../../src/services/recommendationsService";
import { recommendationRepository } from "../../src/repositories/recommendationRepository";
import { jest } from "@jest/globals";
import { recommendationDataFactory } from "../factories/recomendationFactory";

const notFoundError = {
	message: "",
	type: "not_found",
};

const conflictError = {
	message: "Os nomes das recomendações devem ser únicos!",
	type: "conflict",
};

describe("Testa:  /RecommendationService/Insert", () => {
	beforeEach(resetTests);
	it("Espera erro com uma recomendação duplicada", async () => {
		const recommendation = recommendationDataFactory();

		jest
			.spyOn(recommendationRepository, "findByName")
			.mockResolvedValue({ ...recommendation });
		jest.spyOn(recommendationRepository, "create").mockResolvedValue();

		expect(async () => {
			await recommendationService.insert(recommendation);
		}).rejects.toEqual(conflictError);
	});
});

describe("Testa: /RecommendationService/upvote", () => {
	beforeEach(resetTests);
	it("Espera  erro se nenhuma recomendação for encontrada", async () => {
		jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

		expect(async () => {
			await recommendationService.upvote(1);
		}).rejects.toEqual(notFoundError);
	});
});

describe("Testa /RecommendationService/downvote", () => {
	beforeEach(resetTests);
	it("Espera excluir a recomendação se um downvote for menor que -5", async () => {
		const recommendation = recommendationDataFactory();

		jest
			.spyOn(recommendationRepository, "find")
			.mockResolvedValue(recommendation);
		jest
			.spyOn(recommendationRepository, "updateScore")
			.mockResolvedValue({ ...recommendation, score: -6 });

		const remove = jest
			.spyOn(recommendationRepository, "remove")
			.mockResolvedValue(null);

		await recommendationService.downvote(1);

		expect(remove).toHaveBeenCalledTimes(1);
	});

	it("Espera  erro se nenhuma recomendação for encontrada", async () => {
		jest.spyOn(recommendationRepository, "find").mockReturnValue(null);

		expect(async () => {
			await recommendationService.downvote(1);
		}).rejects.toEqual(notFoundError);
	});
});

function resetTests() {
	jest.clearAllMocks();
	jest.resetAllMocks();
}
