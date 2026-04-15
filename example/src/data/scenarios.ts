import type { Locale } from '../lib/i18n';

export type DemoRole = 'user' | 'assistant';

export interface DemoMessage {
  id: string;
  role: DemoRole;
  markdown: string;
}

export type DemoStatus = 'idle' | 'streaming';

export const DEMO_SCENARIOS = ['stream'] as const;

export type DemoScenario = (typeof DEMO_SCENARIOS)[number];

interface TextSegment {
  kind: 'text';
  markdown: string;
  delay?: number;
}

interface ProgressiveSegment {
  kind: 'progressive';
  states: readonly string[];
  delay?: number;
}

type StreamSegment = TextSegment | ProgressiveSegment;

let messageCounter = 0;

const DEMO_STREAM_DELAY_MULTIPLIER = 1.25;
const DEFAULT_TEXT_FRAME_DELAY = 72;
const DEFAULT_PROGRESSIVE_FRAME_DELAY = 220;

const LUO_RIVER_IMAGE = './images/luo-river-illustration.svg';

const SCENARIO_LABELS: Record<Locale, Record<DemoScenario, string>> = {
  en: {
    stream: 'Markdown stream',
  },
  zh: {
    stream: 'Markdown 流式输出',
  },
};

const INTRO_MESSAGES: Record<Locale, string[]> = {
  en: [
    '## Markdown Stream',
    'Memorial on Sending Out the Troops · Rhapsody on the Luo Goddess · On the Six States · The Epang Palace Rhapsody · Preface to the Orchid Pavilion Poems',
  ],
  zh: [
    '## Markdown 流式',
    '《出师表》 《洛神赋》 《六国论》 《阿房宫赋》 《兰亭集序》',
  ],
};

const CHUSHIBIAO_MARKDOWN = joinBlocks([
  '## 《出师表》',
  ...splitParagraphs(`
臣亮言：先帝创业未半而中道崩殂，今天下三分，益州疲弊，此诚危急存亡之秋也。然侍卫之臣不懈于内，忠志之士忘身于外者，盖追先帝之殊遇，欲报之于陛下也。

诚宜开张圣听，以光先帝遗德，恢弘志士之气，不宜妄自菲薄，引喻失义，以塞忠谏之路也。

宫中府中，俱为一体，陟罚臧否，不宜异同。若有作奸犯科及为忠善者，宜付有司论其刑赏，以昭陛下平明之理，不宜偏私，使内外异法也。

侍中、侍郎郭攸之、费祎、董允等，此皆良实，志虑忠纯，是以先帝简拔以遗陛下。愚以为宫中之事，事无大小，悉以咨之，然后施行，必能裨补阙漏，有所广益。

将军向宠，性行淑均，晓畅军事，试用于昔日，先帝称之曰能，是以众议举宠为督。愚以为营中之事，悉以咨之，必能使行阵和睦，优劣得所。

亲贤臣，远小人，此先汉所以兴隆也；亲小人，远贤臣，此后汉所以倾颓也。先帝在时，每与臣论此事，未尝不叹息痛恨于桓、灵也。侍中、尚书、长史、参军，此悉贞良死节之臣，愿陛下亲之信之，则汉室之隆，可计日而待也。

臣本布衣，躬耕于南阳，苟全性命于乱世，不求闻达于诸侯。先帝不以臣卑鄙，猥自枉屈，三顾臣于草庐之中，咨臣以当世之事，由是感激，遂许先帝以驱驰。后值倾覆，受任于败军之际，奉命于危难之间，尔来二十有一年矣。先帝知臣谨慎，故临崩寄臣以大事也。

受命以来，夙夜忧叹，恐托付不效，以伤先帝之明，故五月渡泸，深入不毛。今南方已定，兵甲已足，当奖率三军，北定中原，庶竭驽钝，攘除奸凶，兴复汉室，还于旧都。此臣所以报先帝而忠陛下之职分也。至于斟酌损益，进尽忠言，则攸之、祎、允之任也。

愿陛下托臣以讨贼兴复之效；不效，则治臣之罪，以告先帝之灵。若无兴德之言，则责攸之、祎、允等之慢，以彰其咎。陛下亦宜自谋，以咨诹善道，察纳雅言，深追先帝遗诏。臣不胜受恩感激。

今当远离，临表涕零，不知所言。
  `),
  createMarkdownTable([
    ['人物', '身份', '表中所陈'],
    ['郭攸之、费祎、董允', '侍中、侍郎', '宫中之事，悉以咨之'],
    ['向宠', '将军', '营中之事，悉以咨之'],
    ['诸葛亮', '受托丞相', '北定中原，兴复汉室'],
  ]),
]);

const LUOSHEN_LEAD_MARKDOWN = joinBlocks([
  '## 《洛神赋》',
  ...splitParagraphs(`
黄初三年，余朝京师，还济洛川。古人有言：斯水之神，名曰宓妃。感宋玉对楚王神女之事，遂作斯赋。其辞曰：

余从京域，言归东藩。背伊阙，越轘辕，经通谷，陵景山。日既西倾，车殆马烦。尔乃税驾乎蘅皋，秣驷乎芝田，容与乎阳林，流眄乎洛川。于是精移神骇，忽焉思散，俯则未察，仰以殊观，睹一丽人，于岩之畔。

乃援御者而告之曰：尔有觌于彼者乎？彼何人斯？若此之艳也。

御者对曰：臣闻河洛之神，名曰宓妃。然则君王所见，无乃是乎？其状若何？臣愿闻之。

余告之曰：其形也，翩若惊鸿，婉若游龙。荣曜秋菊，华茂春松。仿佛兮若轻云之蔽月，飘飖兮若流风之回雪。远而望之，皎若太阳升朝霞；迫而察之，灼若芙蕖出渌波。秾纤得衷，修短合度。肩若削成，腰如约素。延颈秀项，皓质呈露。芳泽无加，铅华弗御。云髻峨峨，修眉联娟。丹唇外朗，皓齿内鲜。明眸善睐，靥辅承权。瑰姿艳逸，仪静体闲。柔情绰态，媚于语言。奇服旷世，骨像应图。披罗衣之璀粲兮，珥瑶碧之华琚。戴金翠之首饰，缀明珠以耀躯。践远游之文履，曳雾绡之轻裾。微幽兰之芳蔼兮，步踟蹰于山隅。
  `),
]);

const LUOSHEN_TAIL_MARKDOWN = joinBlocks(
  splitParagraphs(`
于是忽焉纵体，以遨以嬉。左倚采旄，右荫桂旗。攘皓腕于神浒兮，采湍濑之玄芝。余情悦其淑美兮，心振荡而不怡。无良媒以接欢兮，托微波而通辞。愿诚素之先达兮，解玉佩以要之。嗟佳人之信修，羌习礼而明诗。抗琼珶以和予兮，指潜渊而为期。执眷眷之款实兮，惧斯灵之我欺。感交甫之弃言兮，怅犹豫而狐疑。收和颜而静志兮，申礼防以自持。

于是洛灵感焉，徙倚彷徨。神光离合，乍阴乍阳。竦轻躯以鹤立，若将飞而未翔。践椒涂之郁烈，步蘅薄而流芳。超长吟以永慕兮，声哀厉而弥长。尔乃众灵杂遝，命俦啸侣，或戏清流，或翔神渚，或采明珠，或拾翠羽。从南湘之二妃，携汉滨之游女。叹匏瓜之无匹兮，咏牵牛之独处。扬轻袿之猗靡兮，翳修袖以延伫。体迅飞凫，飘忽若神；凌波微步，罗袜生尘。动无常则，若危若安；进止难期，若往若还。转眄流精，光润玉颜。含辞未吐，气若幽兰。华容婀娜，令我忘餐。

于是屏翳收风，川后静波。冯夷鸣鼓，女娲清歌。腾文鱼以警乘，鸣玉鸾以偕逝。六龙俨其齐首，载云车之容裔。鲸鲵踊而夹毂，水禽翔而为卫。

于是越北沚，过南冈，纡素领，回清阳。动朱唇以徐言，陈交接之大纲。恨人神之道殊兮，怨盛年之莫当。抗罗袂以掩涕兮，泪流襟之浪浪。悼良会之永绝兮，哀一逝而异乡。无微情以效爱兮，献江南之明珰。虽潜处于太阴，长寄心于君王。忽不悟其所舍，怅神宵而蔽光。

于是背下陵高，足往神留。遗情想像，顾望怀愁。冀灵体之复形，御轻舟而上溯。浮长川而忘反，思绵绵而增慕。夜耿耿而不寐，沾繁霜而至曙。命仆夫而就驾，吾将归乎东路。揽騑辔以抗策，怅盘桓而不能去。
  `),
);

const LIUGUOLUN_MARKDOWN = joinBlocks([
  '## 《六国论》',
  ...splitParagraphs(`
六国破灭，非兵不利，战不善，弊在赂秦。赂秦而力亏，破灭之道也。或曰：六国互丧，率赂秦耶？曰：不赂者以赂者丧。盖失强援，不能独完。故曰：弊在赂秦也。

秦以攻取之外，小则获邑，大则得城。较秦之所得，与战胜而得者，其实百倍；诸侯之所亡，与战败而亡者，其实亦百倍。则秦之所大欲，诸侯之所大患，固不在战矣。思厥先祖父，暴霜露，斩荆棘，以有尺寸之地。子孙视之不甚惜，举以予人，如弃草芥。今日割五城，明日割十城，然后得一夕安寝。起视四境，而秦兵又至矣。然则诸侯之地有限，暴秦之欲无厌，奉之弥繁，侵之愈急。故不战而强弱胜负已判矣。至于颠覆，理固宜然。古人云：以地事秦，犹抱薪救火，薪不尽，火不灭。此言得之。

齐人未尝赂秦，终继五国迁灭，何哉？与嬴而不助五国也。五国既丧，齐亦不免矣。燕、赵之君，始有远略，能守其土，义不赂秦。是故燕虽小国而后亡，斯用兵之效也。至丹以荆卿为计，始速祸焉。赵尝五战于秦，二败而三胜。后秦击赵者再，李牧连却之。洎牧以谗诛，邯郸为郡，惜其用武而不终也。

且燕赵处秦革灭殆尽之际，可谓智力孤危，战败而亡，诚不得已。向使三国各爱其地，齐人勿附于秦，刺客不行，良将犹在，则胜负之数，存亡之理，当与秦相较，或未易量。

呜呼！以赂秦之地封天下之谋臣，以事秦之心礼天下之奇才，并力西向，则吾恐秦人食之不得下咽也。悲夫！有如此之势，而为秦人积威之所劫，日削月割，以趋于亡。为国者无使为积威之所劫哉！

夫六国与秦皆诸侯，其势弱于秦，而犹有可以不赂而胜之之势。苟以天下之大，而从六国破亡之故事，是又在六国下矣！
  `),
]);

const AFANGGONGFU_MARKDOWN = joinBlocks([
  '## 《阿房宫赋》',
  ...splitParagraphs(`
六王毕，四海一。蜀山兀，阿房出。覆压三百余里，隔离天日。骊山北构而西折，直走咸阳。二川溶溶，流入宫墙。五步一楼，十步一阁；廊腰缦回，檐牙高啄；各抱地势，钩心斗角。盘盘焉，囷囷焉，蜂房水涡，矗不知其几千万落。长桥卧波，未云何龙？复道行空，不霁何虹？高低冥迷，不知西东。歌台暖响，春光融融；舞殿冷袖，风雨凄凄。一日之内，一宫之间，而气候不齐。

妃嫔媵嫱，王子皇孙，辞楼下殿，辇来于秦。朝歌夜弦，为秦宫人。明星荧荧，开妆镜也；绿云扰扰，梳晓鬟也；渭流涨腻，弃脂水也；烟斜雾横，焚椒兰也。雷霆乍惊，宫车过也；辘辘远听，杳不知其所之也。一肌一容，尽态极妍，缦立远视，而望幸焉；有不得见者，三十六年。

燕赵之收藏，韩魏之经营，齐楚之精英，几世几年，剽掠其人，倚叠如山。一旦不能有，输来其间。鼎铛玉石，金块珠砾，弃掷逦迤，秦人视之，亦不甚惜。嗟乎！一人之心，千万人之心也。秦爱纷奢，人亦念其家。奈何取之尽锱铢，用之如泥沙？使负栋之柱，多于南亩之农夫；架梁之椽，多于机上之工女；钉头磷磷，多于在庾之粟粒；瓦缝参差，多于周身之帛缕；直栏横槛，多于九土之城郭；管弦呕哑，多于市人之言语。使天下之人，不敢言而敢怒。独夫之心，日益骄固。戍卒叫，函谷举，楚人一炬，可怜焦土。

呜呼！灭六国者，六国也，非秦也；族秦者，秦也，非天下也。嗟夫！使六国各爱其人，则足以拒秦；使秦复爱六国之人，则递三世可至万世而为君，谁得而族灭也？秦人不暇自哀，而后人哀之；后人哀之而不鉴之，亦使后人而复哀后人也。
  `),
]);

const LANTINGXU_MARKDOWN = joinBlocks([
  '## 《兰亭集序》',
  ...splitParagraphs(`
永和九年，岁在癸丑，暮春之初，会于会稽山阴之兰亭，修禊事也。群贤毕至，少长咸集。此地有崇山峻岭，茂林修竹；又有清流激湍，映带左右。引以为流觞曲水，列坐其次。虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。是日也，天朗气清，惠风和畅。仰观宇宙之大，俯察品类之盛，所以游目骋怀，足以极视听之娱，信可乐也。

夫人之相与，俯仰一世。或取诸怀抱，悟言一室之内；或因寄所托，放浪形骸之外。虽趣舍万殊，静躁不同，当其欣于所遇，暂得于己，快然自足，不知老之将至。及其所之既倦，情随事迁，感慨系之矣。向之所欣，俯仰之间，已为陈迹，犹不能不以之兴怀；况修短随化，终期于尽！古人云：死生亦大矣。岂不痛哉！

每览昔人兴感之由，若合一契，未尝不临文嗟悼，不能喻之于怀。固知一死生为虚诞，齐彭殇为妄作。后之视今，亦犹今之视昔，悲夫！故列叙时人，录其所述，虽世殊事异，所以兴怀，其致一也。后之览者，亦将有感于斯文。
  `),
  createCodeBlock('text', [
    '永和九年，岁在癸丑。',
    '暮春之初，会于会稽山阴之兰亭。',
    '仰观宇宙之大，俯察品类之盛。',
    '后之视今，亦犹今之视昔。',
  ]),
]);

const EN_CHUSHIBIAO_MARKDOWN = joinBlocks([
  '## Memorial on Sending Out the Troops',
  ...splitParagraphs(`
I, Liang, submit this memorial: the late emperor began his great enterprise, yet before half was done he passed away. Now the realm stands divided in three, Yizhou is weary and diminished, and this truly is a moment of peril and survival. Yet the ministers who attend within do not slacken, and the loyal officers outside forget themselves in service, because they remember the extraordinary grace of the late emperor and wish to repay it to Your Majesty.

It is fitting to widen your hearing, to bring honor to the virtue the late emperor left behind, and to enlarge the spirit of worthy men. You should not belittle yourself, cite poor examples, and thereby block the road of loyal remonstrance.

The palace and the chancellery are one body. Rewards and punishments, praise and blame, should not differ between them. If anyone commits wrongdoing, or if anyone proves loyal and good, let the proper offices judge rewards and penalties, so that Your Majesty's governance may be seen as fair and clear.

Attendants Guo Youzhi, Fei Yi, and Dong Yun are all upright and sincere, prudent in thought and pure in loyalty. The late emperor selected them and left them to Your Majesty. I believe that all matters within the palace, great or small, should first be discussed with them; then what is carried out will surely repair omissions and enlarge benefit.

General Xiang Chong is balanced in conduct and well versed in military affairs. The late emperor once tested him and called him capable, and so public opinion raised him to command. I believe that all matters within the camp should be discussed with him; then the ranks will live in harmony and every man will be placed where he belongs.

To draw near to worthy ministers and keep petty men at a distance was the reason the Former Han prospered. To draw near petty men and keep worthy ministers far away was the reason the Later Han collapsed. While the late emperor lived, whenever he discussed this matter with me, he never failed to sigh in grief over Huan and Ling. Those now serving as attendants, secretaries, and counselors are all steadfast ministers willing to die for duty. If Your Majesty trusts them, the revival of Han may be counted by days.

I was originally a common man, farming my own fields in Nanyang, seeking only to preserve life in a chaotic age and never hoping for fame among the lords. The late emperor did not consider me base or insignificant. He humbled himself and visited my thatched cottage three times, asking my views on the affairs of the age. Moved by such grace, I pledged myself to his service. Later, in a time of defeat, I received office amid a broken army and accepted command in a season of danger. Twenty-one years have passed since then.

Since receiving that charge, I have worried day and night, fearing that I might fail the trust left to me and injure the clarity of the late emperor's judgment. Therefore I crossed the Lu in the fifth month and marched deep into barren lands. Now the south is settled, the army is supplied, and it is time to lead the three armies north, pacify the Central Plain, drive out traitors and bandits, restore the House of Han, and return to the old capital. This is how I repay the late emperor and fulfill my duty to Your Majesty.

I beg that Your Majesty entrust me with the task of punishing the enemy and restoring the state. If I fail, punish me and announce my guilt before the spirit of the late emperor. If no words arise that can strengthen virtue, then hold Youzhi, Yi, and Yun to account for their neglect and make their faults known. Your Majesty should also plan for yourself, consult the right way, receive upright counsel, and deeply follow the last commands of the late emperor. Overwhelmed by grace, I cannot fully express my gratitude.

As I am about to depart far away, I face this memorial with tears and do not know what more to say.
  `),
  createMarkdownTable([
    ['Person', 'Role', 'Charge'],
    ['Guo Youzhi', 'Palace attendant', 'Consulted on affairs within the court'],
    ['Fei Yi', 'Palace attendant', 'Consulted on affairs within the court'],
    ['Dong Yun', 'Palace attendant', 'Consulted on affairs within the court'],
    ['Xiang Chong', 'General', 'Consulted on military affairs'],
    ['Zhuge Liang', 'Chancellor', 'Pacify the north and restore Han'],
  ]),
]);

const EN_LUOSHEN_LEAD_MARKDOWN = joinBlocks([
  '## Rhapsody on the Luo Goddess',
  ...splitParagraphs(`
In the third year of Huangchu, I went to the capital and, on my return, crossed the Luo River. The ancients said the spirit of this river was named Mi Fei. Moved by the tale of Song Yu and the King of Chu, I composed this rhapsody.

I left the capital region and set out for my eastern domain. With the sun sinking westward and my horses weary, I rested my carriage by the fragrant bank, fed the team among the herb fields, wandered at ease through the grove, and cast my gaze upon the Luo. Then my spirit shifted and my thoughts were startled. Looking down, I had seen nothing, but when I looked up again I saw a radiant woman by the side of a crag.

I asked the charioteer, "Do you see the one over there? Who can she be, so wondrous in beauty?"

He answered, "I have heard that the goddess of the River Luo is named Mi Fei. If what you have seen is truly she, then how does she appear? I beg to hear it."

I replied, "In form she was like a startled swan, in movement like a roaming dragon. She shone like autumn chrysanthemums and flourished like spring pines. Dimly she seemed like light clouds veiling the moon, and drifting she was like returning snow on the wind. Seen from afar she was bright as the morning sun rising through dawn haze; seen close, she glowed like lotus flowers lifting from clear water. Nothing in her figure was too full or too slight, too tall or too short. Her shoulders seemed carved, her waist bound in white silk, her long neck rose above a fair skin no perfume could improve. Her cloudlike hair towered high, her brows were delicately joined, her red lips shone, her white teeth flashed, her bright eyes were full of feeling, and her poise was tranquil and graceful. Her garments were resplendent beyond the world. She wore jeweled earrings, golden ornaments, and pearls that cast light over her body. In embroidered shoes and a gauze skirt light as mist, she lingered among the hills with the faint fragrance of orchids about her."
  `),
]);

const EN_LUOSHEN_TAIL_MARKDOWN = joinBlocks(
  splitParagraphs(`
Then she let her body move freely, roaming and delighting in play. She leaned to the left against colored banners and to the right beneath cassia flags. She lifted her white arm on the holy bank and gathered dark mushrooms from the rushing shallows. My feelings rejoiced in her gentle beauty, yet my heart shook and would not rest. Without a good matchmaker, I could only send my words upon the slight waves. I wished a trusted messenger would go first, so I loosened my jade pendant to seek her. Alas, that fair one was true and refined, trained in ritual and song. She answered me with a pendant of bright jade and pointed toward the hidden depths as the place of meeting. Holding fast to my earnest devotion, I still feared that such a spirit might deceive me, and remembering the broken promise of Jiao Fu, I wavered in doubt. She then gathered her face into calm and kept herself within the bounds of ritual.

Thereupon the goddess of Luo was moved and lingered in hesitation. Her divine radiance shifted, now shadowed and now bright. She lifted her light body like a crane about to fly, stepped upon fragrant paths, and left perfume among the reeds. She drew out a long cry of longing, and its sorrowful sound grew ever more drawn. Then countless spirits gathered, companions called to companions: some played in the clear current, some hovered over the sacred shoals, some plucked bright pearls, some picked kingfisher feathers. She moved with the ladies of Xiang and the maidens of the Han shore. Her sleeves spread in soft curves, her body swift as a startled duck, unreal as a spirit. She trod the waves with tiny steps and dust rose from her silken shoes. Her motions were uncertain, as though poised between danger and ease, arrival and withdrawal. One sidelong glance sent brightness flowing; her jade-like face glowed. Words were not yet spoken, but her breath was like hidden orchids. Her beauty was so exquisite that I forgot hunger itself.

Then the wind gatherer stilled the breeze, the river lord quieted the waves, Fengyi beat the drums, and Nuwa sang clear songs. Patterned fish leapt before the carriage; jade bells rang as attendants followed. Six dragons raised their heads in ordered ranks, the cloud carriage floated onward, giant creatures leapt beside the wheels, and waterfowl wheeled in guard.

Then she crossed the northern islet and passed the southern ridge, turned her pale neck, and circled in the clear light. She moved her red lips to speak slowly, laying out the full measure of love and parting. She grieved that the ways of humans and gods are different, lamented that youth does not endure, raised her silken sleeve to hide her tears, and let them pour over her robe. Since no small token could answer such feeling, she offered me a bright pendant from the south. Though she must dwell in the dark beyond, she said her heart would dwell with me. At last, before I knew where she had gone, the night spirit had already hidden her light.

Then I left the low bank and climbed the height, but while my feet moved onward, my spirit remained behind. I turned my feelings into image and memory, looked back in sorrow, hoped that her form might appear again, and sent my light boat upstream. Floating along the long river, I forgot to return. My longing only deepened. All night I lay awake, until heavy frost wet the dawn. At last I ordered the servants to harness the carriage for the eastern road, yet even as I gathered the reins and raised the whip, I lingered and could not depart.
  `),
);

const EN_LIUGUOLUN_MARKDOWN = joinBlocks([
  '## On the Six States',
  ...splitParagraphs(`
The six states were destroyed not because their weapons were dull or their battles poorly fought. Their weakness lay in bribing Qin. To bribe Qin was to diminish their own strength; that was the road to ruin. Someone may ask, "Did every state fall because it bribed Qin?" The answer is that those which did not bribe Qin were destroyed because the states that did had already lost the power to support one another.

Apart from what Qin seized by direct attack, even a small bribe meant towns and even a great bribe meant cities. Compare what Qin gained from bribes with what it gained from victory in war, and the difference is several times over. Compare what the feudal lords lost through bribery with what they lost on the battlefield, and that difference is just as great. The great desire of Qin, and the great danger of the other states, therefore did not truly lie in open battle. Their forefathers endured frost and dew, cut through thorn and brush, and only then secured each small strip of land. Their descendants gave those lands away as though tossing out weeds. Five cities today, ten cities tomorrow, and only then a single night's sleep in peace; but at dawn, Qin's troops were once again at the borders. Since the lands of the states were limited while Qin's greed knew no limit, the more richly they yielded, the more fiercely Qin pressed. Thus, before the fighting even began, strength and weakness, victory and defeat, were already decided. Their collapse followed the logic of the situation. As the ancients said, "To serve Qin with land is like carrying firewood to save a fire: if the wood never runs out, the fire never dies."

Qi never bribed Qin, yet in the end it followed the other five states into extinction. Why? Because it attached itself to Qin and would not aid the five states. Once the five were gone, Qi could not escape alone. The rulers of Yan and Zhao at first had far-reaching plans and were able to hold their own lands; by principle they would not bribe Qin. Therefore Yan, though small, perished later, which shows the effect of resistance. Yet when Crown Prince Dan relied on Jing Ke's assassination plot, he only hastened disaster. Zhao fought Qin five times, losing twice and winning three times. Later, when Qin attacked Zhao twice more, Li Mu drove it back both times. But once Li Mu was killed by slander, Handan became a commandery. It is painful that Zhao's military resolve did not last to the end.

Yan and Zhao stood in the moment when Qin had nearly erased every other state, so their wisdom and strength were isolated and endangered. Their defeat and destruction were truly unavoidable. But if the three states in the south had each cherished their own lands, if Qi had not allied itself with Qin, if the assassin had not gone forth, and if good generals had remained alive, then the numbers of victory and defeat, the logic of survival and extinction, might not have been easy to determine.

Alas, if the lands used to bribe Qin had instead been used to enfeoff the world's strategists, and the same energy spent serving Qin had instead been used to honor the world's extraordinary talents, then joining forces westward, I fear Qin would have found the very thought impossible to swallow. Sad indeed: with such a position, the states still let themselves be cowed by Qin's accumulated power, to be cut away day by day and month by month until they rushed toward destruction. Let those who govern a state never allow themselves to be coerced by accumulated intimidation.

The six states and Qin were all feudal lords. Their power was weaker than Qin's, yet they still possessed the possibility of victory without bribery. If a realm as large as ours should follow the old story of the six states' ruin, then we would rank below the six states themselves.
  `),
]);

const EN_AFANGGONGFU_MARKDOWN = joinBlocks([
  '## The Epang Palace Rhapsody',
  ...splitParagraphs(`
When the six kings were gone and the four seas were one, the mountains of Shu were stripped bare and the Epang Palace rose. It spread across more than three hundred li, shutting out the sky and the sun. From Mount Li it bent north and westward and ran straight toward Xianyang. Two rivers flowed broad and deep into the palace walls. Every five paces stood a tower, every ten paces a pavilion. Corridors curled like waists, eaves thrust upward like pecking beaks, each structure following the lay of the land and locking horns with the next. Layer upon layer, ring upon ring, they stood like honeycombs and whirlpools of water, so many that no one knew their number. A long bridge lay across the waves; without clouds, why did it seem like a dragon? A flying passage crossed the air; without rain, why did it seem like a rainbow? Heights and depths were lost in shadow, east and west no longer clear. Song terraces carried warm sounds as if spring were melting everywhere, while dance halls let out sleeves cold as wind and rain. In a single day, within a single palace, the climate itself differed from court to court.

Consorts, ladies, princes, and descendants of kings left their towers and halls and were brought in carriages to Qin. Singing by morning and strumming by night, they became palace people of Qin. The glittering lights were dressing mirrors being opened; the cloudlike mass was hair being combed at dawn. The grease from discarded cosmetics made the Wei River swell; the drifting smoke was orchids and pepper burned in censers. A sudden crash like thunder meant the imperial carriage had passed, and its rolling wheels faded so far away that no one knew where it had gone. Every face and every figure exhausted the range of beauty. They stood for years looking into the distance, hoping for favor, and some did not receive it in thirty-six years.

The treasures of Yan and Zhao, the hoards of Han and Wei, the finest ornaments of Qi and Chu, amassed through generations and years, were plundered from the people and piled up like mountains. In a single day, none of those states could keep them, and all were carried into the palace. Tripods were treated like cooking pots, jade like stones, gold like clods, pearls like gravel, thrown aside in long winding heaps. The people of Qin looked on without thinking them precious. Alas, the heart of one man is also the heart shared by ten thousand men. Qin loved extravagance, yet every person also cherishes his own household. Why strip others down to the last grain and then spend what was taken like mud and sand? The pillars that bore the beams were more numerous than farmers in the southern fields; the rafters were more numerous than women at the looms; the shining nailheads were more numerous than stored grain in the granaries; the seams in the tiles were more numerous than the threads in all the garments people wore; the straight railings and crossbars were more numerous than the city walls across the nine lands; the noisy pipes and strings were more numerous than the voices in the marketplace. Thus the people of the world did not dare to speak, though they dared to feel anger. The heart of the lone tyrant grew ever prouder and harder. Then the garrison soldiers cried out, Hangu Pass was broken, and with a single torch from Chu, all that splendor turned to pitiful ash.

Alas, it was the six states that destroyed the six states, not Qin alone. It was Qin that destroyed Qin, not the world alone. If the six states had each cherished their own people, that would have been enough to resist Qin. If Qin, in turn, had cherished the people of the six states, then the line might have passed from generation to generation and stretched into ten thousand ages. Who could then have destroyed it? The people of Qin had no time to grieve for themselves, and so later ages grieved for them. But if later ages grieve without taking warning, then those later ages will only cause still later people to grieve for them in turn.
  `),
]);

const EN_LANTINGXU_MARKDOWN = joinBlocks([
  '## Preface to the Orchid Pavilion Poems',
  ...splitParagraphs(`
In the ninth year of Yonghe, in the cyclical year guichou, at the beginning of late spring, we gathered at the Orchid Pavilion in Shanyin of Kuaiji to perform the purification rite. All the worthy friends had arrived, both young and old. Here there were lofty mountains and steep ridges, luxuriant woods and tall bamboo; there was also a clear stream with rushing water, reflecting and winding around us on both sides. We drew the stream into a winding channel for floating cups and sat in order beside it. Though there was none of the full splendor of strings and pipes, a single cup and a single poem were enough to let us pour out our hidden feelings. On that day the sky was clear, the air was bright, and the gentle wind moved in ease. Looking up, we could behold the vastness of the universe; looking down, we could observe the richness of all things. Thus we let our eyes roam and our hearts race, enough to exhaust the pleasures of sight and sound. Truly, this was joy.

As people live together through the span of a life, some take what is in their hearts and speak of it face to face within one room; others entrust themselves to what they love and wander beyond the restraints of the body. Though our choices differ without measure and stillness and agitation are never the same, when each of us is delighted by what he encounters, then for a while he finds contentment in himself and does not realize that old age is approaching. Yet once what he once delighted in has been exhausted, feeling shifts with events, and sorrow settles upon him. What once gave joy becomes, in the time between one glance up and one glance down, only a trace of the past, and still one cannot help but be moved by it. How much more is this so when the length of life follows transformation and must in the end come to its limit. The ancients said, "Life and death are indeed matters of the greatest weight." How could that not bring pain?

Whenever I read the reasons for feeling in those who came before us, they seem to fit our own as though matched by a single tally, and I have never failed to sigh over the page, unable to explain fully what stirs within me. I know for certain that treating life and death as one is empty talk, and calling long life and early death equal is absurd. Those who come after us will look upon our present just as we look upon the past. That is sorrow indeed. Therefore I have recorded the people of this gathering and copied what each has written. Though times and circumstances differ, the cause of feeling remains one. Those who later read this will surely also be moved by these words.
  `),
  createCodeBlock('text', [
    'In the ninth year of Yonghe, late spring had just begun.',
    'We gathered at the Orchid Pavilion in Shanyin of Kuaiji.',
    'Looking up, we observed the vastness of the cosmos.',
    'Those who come after us will view our present as we view the past.',
  ]),
]);

const ZH_CLASSICAL_STREAM_SEGMENTS: readonly StreamSegment[] = [
  {
    kind: 'text',
    markdown: CHUSHIBIAO_MARKDOWN,
  },
  {
    kind: 'text',
    markdown: LUOSHEN_LEAD_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: createLuoImageStates('洛川神光'),
  },
  {
    kind: 'text',
    markdown: LUOSHEN_TAIL_MARKDOWN,
  },
  {
    kind: 'text',
    markdown: LIUGUOLUN_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: [
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[六国破灭]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[六国破灭] --> B[弊在赂秦]',
        '  B --> C[诸侯之地有限]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[六国破灭] --> B[弊在赂秦]',
        '  B --> C[诸侯之地有限]',
        '  C --> D[暴秦之欲无厌]',
        '  D --> E[奉之弥繁 侵之愈急]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[六国破灭] --> B[弊在赂秦]',
        '  B --> C[诸侯之地有限]',
        '  C --> D[暴秦之欲无厌]',
        '  D --> E[奉之弥繁 侵之愈急]',
        '  E --> F[日削月割 以趋于亡]',
      ]),
    ],
  },
  {
    kind: 'text',
    markdown: AFANGGONGFU_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: [
      createMathBlock('\\text{取之尽锱铢}'),
      createMathBlock(
        '\\text{取之尽锱铢} \\Rightarrow \\text{用之如泥沙}',
      ),
      createMathBlock(
        '\\text{取之尽锱铢} \\Rightarrow \\text{用之如泥沙} \\Rightarrow \\text{天下之人不敢言而敢怒}',
      ),
      createMathBlock(
        '\\text{取之尽锱铢} \\Rightarrow \\text{用之如泥沙} \\Rightarrow \\text{楚人一炬}',
      ),
    ],
  },
  {
    kind: 'text',
    markdown: LANTINGXU_MARKDOWN,
  },
] as const;

const EN_CLASSICAL_STREAM_SEGMENTS: readonly StreamSegment[] = [
  {
    kind: 'text',
    markdown: EN_CHUSHIBIAO_MARKDOWN,
  },
  {
    kind: 'text',
    markdown: EN_LUOSHEN_LEAD_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: createLuoImageStates('Radiance above the Luo River'),
  },
  {
    kind: 'text',
    markdown: EN_LUOSHEN_TAIL_MARKDOWN,
  },
  {
    kind: 'text',
    markdown: EN_LIUGUOLUN_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: [
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[The six states fall]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[The six states fall] --> B[The flaw is appeasing Qin]',
        '  B --> C[Their lands are finite]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[The six states fall] --> B[The flaw is appeasing Qin]',
        '  B --> C[Their lands are finite]',
        '  C --> D[Qin\'s appetite has no end]',
        '  D --> E[The more they yield, the harder Qin presses]',
      ]),
      createCodeBlock('mermaid', [
        'flowchart TD',
        '  A[The six states fall] --> B[The flaw is appeasing Qin]',
        '  B --> C[Their lands are finite]',
        '  C --> D[Qin\'s appetite has no end]',
        '  D --> E[The more they yield, the harder Qin presses]',
        '  E --> F[Day by day they are carved away]',
      ]),
    ],
  },
  {
    kind: 'text',
    markdown: EN_AFANGGONGFU_MARKDOWN,
  },
  {
    kind: 'progressive',
    delay: 420,
    states: [
      createMathBlock('\\text{extract every last grain}'),
      createMathBlock(
        '\\text{extract every last grain} \\Rightarrow \\text{spend like mud and sand}',
      ),
      createMathBlock(
        '\\text{extract every last grain} \\Rightarrow \\text{spend like mud and sand} \\Rightarrow \\text{the people dare to feel anger}',
      ),
      createMathBlock(
        '\\text{extract every last grain} \\Rightarrow \\text{spend like mud and sand} \\Rightarrow \\text{Chu sets one torch}',
      ),
    ],
  },
  {
    kind: 'text',
    markdown: EN_LANTINGXU_MARKDOWN,
  },
] as const;

export function getScenarioLabels(locale: Locale) {
  return SCENARIO_LABELS[locale];
}

export function createIntroMessage(locale: Locale): DemoMessage {
  return {
    id: nextMessageId('assistant'),
    role: 'assistant',
    markdown: joinBlocks(INTRO_MESSAGES[locale]),
  };
}

export function createPromptMessage(
  locale: Locale,
  scenario: DemoScenario,
): DemoMessage {
  const labels = getScenarioLabels(locale);

  return {
    id: nextMessageId('user'),
    role: 'user',
    markdown:
      locale === 'zh'
        ? `开始流式输出：**${labels[scenario]}**`
        : `Start stream: **${labels[scenario]}**`,
  };
}

export function createScenarioFrames(locale: Locale, scenario: DemoScenario) {
  switch (scenario) {
    case 'stream':
      return createSegmentFrames(
        locale === 'zh'
          ? ZH_CLASSICAL_STREAM_SEGMENTS
          : EN_CLASSICAL_STREAM_SEGMENTS,
        locale,
      );
  }
}

export function nextMessageId(prefix: string) {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
}

function createLuoImageStates(alt: string) {
  return [createMarkdownImage(alt, LUO_RIVER_IMAGE)];
}

function createSegmentFrames(
  segments: readonly StreamSegment[],
  locale: Locale,
) {
  const frames: Array<{ delay: number; markdown: string }> = [];
  let current = '';

  for (const segment of segments) {
    if (segment.kind === 'text') {
      const nextText = prefixMarkdown(current, segment.markdown);

      for (const chunk of chunkMarkdown(nextText, locale)) {
        current += chunk;
        frames.push({
          delay: scaleDemoDelay(segment.delay ?? DEFAULT_TEXT_FRAME_DELAY),
          markdown: current,
        });
      }

      continue;
    }

    const base = current;

    for (const state of segment.states) {
      frames.push({
        delay: scaleDemoDelay(segment.delay ?? DEFAULT_PROGRESSIVE_FRAME_DELAY),
        markdown: appendMarkdown(base, state),
      });
    }

    current = appendMarkdown(base, segment.states.at(-1) ?? '');
  }

  return frames;
}

function scaleDemoDelay(delay: number) {
  return Math.round(delay * DEMO_STREAM_DELAY_MULTIPLIER);
}

function chunkMarkdown(text: string, locale: Locale) {
  const sizes = locale === 'zh' ? [18, 22, 20, 24, 16] : [40, 48, 44, 52, 36];
  const chunks: string[] = [];
  let cursor = 0;
  let index = 0;

  while (cursor < text.length) {
    const size = sizes[index % sizes.length];
    chunks.push(text.slice(cursor, cursor + size));
    cursor += size;
    index += 1;
  }

  return chunks;
}

function prefixMarkdown(current: string, markdown: string) {
  return current.length === 0 ? markdown : `\n\n${markdown}`;
}

function appendMarkdown(base: string, addition: string) {
  if (base.length === 0) {
    return addition;
  }

  if (addition.length === 0) {
    return base;
  }

  return `${base}\n\n${addition}`;
}

function joinBlocks(blocks: readonly string[]) {
  return blocks.filter(Boolean).join('\n\n');
}

function createMarkdownImage(alt: string, src: string) {
  return `![${escapeMarkdownAltText(alt)}](<${src}>)`;
}

function createCodeBlock(language: string, lines: readonly string[]) {
  return [`\`\`\`${language}`, ...lines, '```'].join('\n');
}

function createMathBlock(expression: string) {
  return ['$$', expression, '$$'].join('\n');
}

function createMarkdownTable(rows: readonly (readonly string[])[]) {
  const [header, ...body] = rows;
  if (!header) {
    return '';
  }

  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function escapeMarkdownAltText(value: string) {
  return value.replaceAll('[', '\\[').replaceAll(']', '\\]');
}

function splitParagraphs(value: string) {
  return value
    .trim()
    .split(/\r?\n\r?\n/u)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}
