export const firstTopic = "tawheed";
export const postLastTopicMarker = "POST_LAST_TOPIC";

//topic: nexttopic, [summaryId1, extraInfo1], [summaryId2, extraInfo2], ...
//SB means "Summarized book", and is only used when one book is used as the main source.
export const topics: {[key: string]: (string | string[])[]} = {
	tawheed: [
		"aqeedah",
		["The_names_of_Allah","(incomplete)"],
		["Explanation_Of_The_Four_Rules_Regarding_Shirk","SB"]
	],
	aqeedah: [
		"supplication",
		["The_Explanation_Of_The_Three_Fundamental_Principles","SB (incomplete)"]
	],
	supplication: [
		"purification",
		["A_Collection_Of_Supplications","(incomplete)"],
		["Etiquettes_of_Supplicating_to_Allah","SB"],
	],
	purification: [
		"salah",
 		["the_prophets_wudhoo_described","SB"]
	],
	salah: [
		"fasting",
		["The_Conditions,_Pillars_and_Requirements_of_the_Prayer","SB"],
		["Description_Of_Salah","(incomplete)"],
		["As-Sunan_Ar-Rawatib",""]
	],
	fasting: [
		"tafsir",
		["the_rulings_of_ramadan","SB (incomplete)"],
	],
	tafsir: [
		"good_manners",
		["tafsir_ibn_kathir","SB (incomplete)"],
		["how_are_we_obligated_to_interpret_the_noble_quran","SB (incomplete)"],
	],
	good_manners: [
		postLastTopicMarker,
		["gaurding_the_tongue","SB"],
		["eating_etiquettes","(incomplete)"]
	]
};
