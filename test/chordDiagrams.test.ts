import ChordsDB from "@tombatossals/chords-db";
import {dbChordToVexChord, userDefinedToVexChord} from "../src/chordDiagrams";

function findChord(instrument: keyof typeof ChordsDB, key: string, suffix: string) {
	return ChordsDB[instrument].chords[key].find(chord => chord.suffix === suffix);
}

function testDbChord(instrument: keyof typeof ChordsDB, key: string, suffix: string, positionIndex: number, expectedResult: unknown) {
	const chord = findChord(instrument, key, suffix);
	expect(chord).toBeDefined();

	const result = dbChordToVexChord(chord!, positionIndex);
	expect(result).toEqual(expectedResult);
}

describe("Conversion of chords to vexchord format", () => {
	describe("dbChordToVexChord", () => {
		describe("open chords", () => {
			test("Basic open C major", () => {
				testDbChord("guitar", "C", "major", 0, {
					chord: [
						[1, 0],
						[2, 1],
						[3, 0],
						[4, 2],
						[5, 3],
						[6, "x"]
					],
					position: 1,
					barres: [],
					tuning: ["", "3", "2", "", "1", ""]
				});
			});

			test("Basic open A minor", () => {
				testDbChord("guitar", "A", "minor", 0, {
					chord: [
						[1, 0],
						[2, 1],
						[3, 2],
						[4, 2],
						[5, 0],
						[6, "x"]
					],
					position: 1,
					barres: [],
					tuning: ["", "", "2", "3", "1", ""]
				});
			});

			test("Basic open D major", () => {
				testDbChord("guitar", "D", "major", 0, {
					chord: [
						[1, 2],
						[2, 3],
						[3, 2],
						[4, 0],
						[5, "x"],
						[6, "x"]
					],
					position: 1,
					barres: [],
					tuning: ["", "", "", "1", "3", "2"]
				});
			});
		});

		describe("barre chords", () => {
			test("Basic F major", () => {
				testDbChord("guitar", "F", "major", 0, {
					chord: [
						[3, 2],
						[4, 3],
						[5, 3]
					],
					position: 1,
					barres: [
						{
							fromString: 6,
							toString: 1,
							fret: 1
						}
					],
					tuning: ["1", "3", "4", "2", "1", "1"]
				});
			});

			test("C#7 position 2", () => {
				testDbChord("guitar", "Csharp", "7", 2, {
					chord: [
						[1, 2],
						[5, 3],
						[6, 4]
					],
					position: 6,
					barres: [
						{
							fromString: 4,
							toString: 2,
							fret: 1
						}
					],
					tuning: ["4", "3", "1", "1", "1", "2"]
				});
			});

			test("C#m9 position 0", () => {
				testDbChord("guitar", "Csharp", "m9", 0, {
					chord: [
						[4, 2],
						[6, "x"]
					],
					position: 1,
					barres: [
						{
							fromString: 5,
							toString: 1,
							fret: 4
						}
					],
					tuning: ["", "2", "1", "3", "4", "4"]
				});
			});
		});

		describe("different positions", () => {

			test("A minor position 2 (barre on 5th fret)", () => {
				testDbChord("guitar", "A", "minor", 2, {
					chord: [
						[4, 3],
						[5, 3]
					],
					position: 5,
					barres: [
						{
							fromString: 6,
							toString: 1,
							fret: 1
						}
					],
					tuning: ["1", "3", "4", "1", "1", "1"]
				});
			});

			test("A minor position 3 (7th fret position)", () => {
				testDbChord("guitar", "A", "minor", 3, {
					chord: [
						[1, 2],
						[2, 4],
						[3, 3],
						[4, 1],
						[5, 0],
						[6, "x"]
					],
					position: 7,
					barres: [],
					tuning: ["", "", "1", "3", "4", "2"]
				});
			});
		});

		describe("different instruments", () => {
			test("Ukulele C major", () => {
				testDbChord("ukulele", "C", "major", 0, {
					chord: [
						[1, 3],
						[2, 0],
						[3, 0],
						[4, 0]
					],
					position: 1,
					barres: [],
					tuning: ["", "", "", "3"]
				});
			});

			test("Mandolin C major", () => {
				testDbChord("mandolin", "C", "major", 0, {
					chord: [
						[1, 0],
						[2, 3],
						[3, 2],
						[4, 0]
					],
					position: 1,
					barres: [],
					tuning: ["", "1", "2", ""]
				});
			});
		});
	});

	describe("userDefinedToVexChord", () => {
		test("basic fret pattern", () => {
			const userChord = {frets: "320013", position: 1};
			const result = userDefinedToVexChord(userChord, 6);

			expect(result).toEqual({
				chord: [
					[6, 3],
					[5, 2],
					[4, 0],
					[3, 0],
					[2, 1],
					[1, 3]
				],
				position: 1,
				barres: [],
				tuning: []
			});
		});

		test("single barre pattern", () => {
			const userChord = {frets: "_335533_", position: 1};
			const result = userDefinedToVexChord(userChord, 6);

			expect(result).toEqual({
				chord: [
					[6, 3],
					[5, 3],
					[4, 5],
					[3, 5],
					[2, 3],
					[1, 3]
				],
				position: 1,
				barres: [
					{
						fromString: 6,
						toString: 1,
						fret: 3
					}
				],
				tuning: []
			});
		});

		test("muted strings with x", () => {
			const userChord = {frets: "x32010", position: 1};
			const result = userDefinedToVexChord(userChord, 6);

			expect(result).toEqual({
				chord: [
					[6, "x"],
					[5, 3],
					[4, 2],
					[3, 0],
					[2, 1],
					[1, 0]
				],
				position: 1,
				barres: [],
				tuning: []
			});
		});

		test("double barre pattern", () => {
			const userChord = {frets: "_3333__55_", position: 1};
			const result = userDefinedToVexChord(userChord, 6);

			expect(result).toEqual({
				chord: [
					[6, 3],
					[5, 3],
					[4, 3],
					[3, 3],
					[2, 5],
					[1, 5]
				],
				position: 1,
				barres: [
					{
						fromString: 6,
						toString: 3,
						fret: 3
					},
					{
						fromString: 2,
						toString: 1,
						fret: 5
					}
				],
				tuning: []
			});
		});
	});
});
