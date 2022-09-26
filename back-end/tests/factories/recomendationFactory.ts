import { prisma } from "../../src/database";
import { faker } from "@faker-js/faker";
import { Recommendation } from "@prisma/client";

export async function recommendationFactory() {
	const result = await prisma.recommendation.create({
		data: {
			name: "Metallica: Nothing Else Matters",
			youtubeLink:
				"https://www.youtube.com/watch?v=tAGnKpE4NCI&ab_channel=Metallica",
		},
	});

	return result;
}

export function recommendationDataFactory(): Recommendation {
	return {
		id: 1,
		name: faker.name.findName(),
		youtubeLink: faker.internet.url(),
		score: -5,
	};
}

export async function recommendationIncrementScore(id: number) {
	await prisma.recommendation.update({
		where: { id },
		data: {
			score: { increment: 1 },
		},
	});
}

export async function recommendationDecreaseScore(id: number) {
	await prisma.recommendation.update({
		where: { id },
		data: {
			score: { decrement: 1 },
		},
	});
}

type bodyInputType =
	| "correct"
	| "wrongLink"
	| "missingName"
	| "missingLink"
	| "notStringName";

export function recommendationBodyFactory(setting: bodyInputType) {
	let name: any, youtubeLink: any;

	switch (setting) {
		case "correct":
			name = "Metallica: Nothing Else Matters";
			youtubeLink =
				"https://www.youtube.com/watch?v=tAGnKpE4NCI&ab_channel=Metallica";
			break;

		case "wrongLink":
			name = "Metallica: Nothing Else Matters";
			youtubeLink = "https://www.yt.com/watch?v=chwyjJbcs1Y";
			break;

		case "missingLink":
			name = "Metallica: Nothing Else Matters";
			youtubeLink = "";
			break;
		case "missingName":
			name = "";
			youtubeLink =
				"https://www.youtube.com/watch?v=tAGnKpE4NCI&ab_channel=Metallica";
			break;

		case "notStringName":
			name = 1;
			youtubeLink =
				"https://www.youtube.com/watch?v=tAGnKpE4NCI&ab_channel=Metallica";
			break;

		default:
			break;
	}

	return { name, youtubeLink };
}

export async function manyRecommendationsFactory() {
	await prisma.recommendation.createMany({
		data: [
			{
				name: "Metallica: Nothing Else Matters",
				youtubeLink:
					"https://www.youtube.com/watch?v=tAGnKpE4NCI&ab_channel=Metallica",
				score: faker.datatype.number(500),
			},
			{
				name: "Red Hot Chili Peppers",
				youtubeLink:
					"https://www.youtube.com/watch?v=Q0oIoR9mLwc&ab_channel=RedHotChiliPeppers",
				score: faker.datatype.number(500),
			},
			{
				name: "Red Hot Chili Peppers - Scar Tissue",
				youtubeLink:
					"https://www.youtube.com/watch?v=mzJj5-lubeM&ab_channel=RedHotChiliPeppers",
				score: faker.datatype.number(500),
			},
			{
				name: "Red Hot Chili Peppers - Under The Bridge",
				youtubeLink:
					"https://www.youtube.com/watch?v=GLvohMXgcBo&ab_channel=RedHotChiliPeppers",
				score: faker.datatype.number(500),
			},
		],
		skipDuplicates: true,
	});
}

export async function nthRecommendationsFactory(number: number) {
	const data = [];
	for (let i = 0; i < number; i++) {
		data.push({
			name: faker.name.findName(),
			youtubeLink: faker.internet.url(),
		});
	}
	await prisma.recommendation.createMany({
		data,
		skipDuplicates: true,
	});
}
