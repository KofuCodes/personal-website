
export interface PhotoTag {
  /** What the tag reads, like a handle */
  label: string;
  href: string;
  /** Where it points, as a percentage of the photo's width and height */
  x: number;
  y: number;
}

export interface Photo {
  id: string;
  url: string;
  location: string;
  year: string;
  /** People in the shot, shown Instagram-style in the lightbox */
  tags?: PhotoTag[];
}

export const photos: Photo[] = [
  {
    id: '1',
    url: '/photography/San Francisco - 2025/DSCN3623.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '2',
    url: '/photography/San Francisco - 2025/DSCN3672.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '3',
    url: '/photography/San Francisco - 2025/DSCN3680.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '4',
    url: '/photography/San Francisco - 2025/DSCN3692.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '5',
    url: '/photography/San Francisco - 2025/DSCN3696.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '6',
    url: '/photography/San Francisco - 2025/DSCN3697.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '7',
    url: '/photography/San Francisco - 2025/DSCN3756.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '8',
    url: '/photography/San Francisco - 2025/DSCN3757.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '9',
    url: '/photography/San Francisco - 2025/DSCN3760.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '10',
    url: '/photography/San Francisco - 2025/DSCN3775.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '11',
    url: '/photography/San Francisco - 2025/DSCN3776.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '12',
    url: '/photography/San Francisco - 2025/DSCN3792.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '16',
    url: '/photography/San Francisco - 2025/DSCN3844.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '17',
    url: '/photography/San Francisco - 2025/DSCN3851.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '18',
    url: '/photography/San Francisco - 2025/DSCN3860.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '19',
    url: '/photography/San Francisco - 2025/DSCN3864.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '20',
    url: '/photography/San Francisco - 2025/DSCN3873.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '21',
    url: '/photography/San Francisco - 2025/DSCN3892.JPG',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '103',
    url: '/photography/San Francisco - 2025/IMG_3430.jpg',
    location: 'San Francisco, California',
    year: '2025'
  },
  {
    id: '24',
    url: '/photography/Hamilton - 2025/001456560015.jpeg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '25',
    url: '/photography/Hamilton - 2025/001456570007.jpeg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '26',
    url: '/photography/Hamilton - 2025/0DE1EF72-6747-412C-8701-B77443A831FA.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '27',
    url: '/photography/Hamilton - 2025/6D4CE400-D7C3-4B05-ABA9-1A9513945EAF.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '31',
    url: '/photography/Hamilton - 2025/DSC03133.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '33',
    url: '/photography/Hamilton - 2025/DSC03191.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '36',
    url: '/photography/Hamilton - 2025/DSC03246.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '37',
    url: '/photography/Hamilton - 2025/DSC03255.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '38',
    url: '/photography/Hamilton - 2025/DSC03265.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '39',
    url: '/photography/Hamilton - 2025/DSC03266.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '40',
    url: '/photography/Hamilton - 2025/DSCN3546.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '41',
    url: '/photography/Hamilton - 2025/IMG_2763.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '45',
    url: '/photography/Hamilton - 2025/IMG_6128.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '109',
    url: '/photography/Hamilton - 2025/IMG_1532.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '111',
    url: '/photography/Hamilton - 2025/IMG_2395.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '113',
    url: '/photography/Hamilton - 2025/IMG_2999.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '114',
    url: '/photography/Hamilton - 2025/IMG_3153.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '117',
    url: '/photography/Hamilton - 2025/IMG_4073.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '118',
    url: '/photography/Hamilton - 2025/IMG_5874.jpg',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '46',
    url: '/photography/Selena_s Bday/beauty_1758412825422.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '48',
    url: '/photography/Selena_s Bday/DSC03895.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '50',
    url: '/photography/Selena_s Bday/DSC03909.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '51',
    url: '/photography/Selena_s Bday/DSC03911.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '52',
    url: '/photography/Will_s bday/DSC03277.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '53',
    url: '/photography/Will_s bday/DSC03291.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '54',
    url: '/photography/Will_s bday/DSC03292.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '55',
    url: '/photography/Will_s bday/DSC03301.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '56',
    url: '/photography/Will_s bday/DSC03305.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '57',
    url: '/photography/Will_s bday/DSC03316.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '58',
    url: '/photography/Will_s bday/DSC03319.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '59',
    url: '/photography/Will_s bday/DSC03323.JPG',
    location: 'Hamilton, Ontario',
    year: '2025'
  },
  {
    id: '60',
    url: '/photography/Montréal/IMG_1487.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '61',
    url: '/photography/Montréal/IMG_1515.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '62',
    url: '/photography/Montréal/IMG_1518.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '63',
    url: '/photography/Montréal/IMG_1534.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '64',
    url: '/photography/Montréal/IMG_1555.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '65',
    url: '/photography/Montréal/IMG_1608.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '66',
    url: '/photography/Montréal/IMG_1610.JPG',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '67',
    url: '/photography/Montréal/IMG_4085.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '68',
    url: '/photography/Montréal/IMG_4239.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '104',
    url: '/photography/Montréal/IMG_4154.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '106',
    url: '/photography/Montréal/IMG_4199.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '107',
    url: '/photography/Montréal/IMG_4201.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '108',
    url: '/photography/Montréal/IMG_4266.jpg',
    location: 'Montreal, Québec',
    year: '2025'
  },
  {
    id: '72',
    url: '/photography/Waterloo - 2025/DSC03662.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '73',
    url: '/photography/Waterloo - 2025/DSC03671.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '74',
    url: '/photography/Waterloo - 2025/DSC03673.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '75',
    url: '/photography/Waterloo - 2025/DSC03687.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '76',
    url: '/photography/Waterloo - 2025/DSC03717.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '77',
    url: '/photography/Waterloo - 2025/DSC03719.JPG',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '121',
    url: '/photography/Waterloo - 2025/IMG_0419.jpg',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '123',
    url: '/photography/Waterloo - 2025/IMG_4513.jpg',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '125',
    url: '/photography/Waterloo - 2025/IMG_4756.jpg',
    location: 'Waterloo, Ontario',
    year: '2025'
  },
  {
    id: '78',
    url: '/photography/Toronto - 2025/DSC03813.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '79',
    url: '/photography/Toronto - 2025/DSC03850.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '80',
    url: '/photography/Toronto - 2025/DSC03933.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '81',
    url: '/photography/Toronto - 2025/DSC03951.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '82',
    url: '/photography/Toronto - 2025/DSC03953.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '83',
    url: '/photography/Toronto - 2025/IMG_0381.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '84',
    url: '/photography/Toronto - 2025/IMG_5399.JPG',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '95',
    url: '/photography/Toronto - 2025/IMG_0519.jpg',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '97',
    url: '/photography/Toronto - 2025/IMG_1965.jpg',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '100',
    url: '/photography/Toronto - 2025/IMG_2625.jpg',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '101',
    url: '/photography/Toronto - 2025/IMG_2626.jpg',
    location: 'Toronto, Ontario',
    year: '2025'
  },
  {
    id: '85',
    url: '/photography/Toronto - 2024/DDCC80F7-F3EA-4DBD-961E-EC18ECE19DCC.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '86',
    url: '/photography/Toronto - 2024/IMG_0896.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '88',
    url: '/photography/Toronto - 2024/IMG_4587.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '89',
    url: '/photography/Toronto - 2024/IMG_9392.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '91',
    url: '/photography/Toronto - 2024/IMG_9419.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '92',
    url: '/photography/Toronto - 2024/IMG_9427.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '93',
    url: '/photography/Toronto - 2024/IMG_9428.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '94',
    url: '/photography/Toronto - 2024/IMG_9846.jpg',
    location: 'Toronto, Ontario',
    year: '2024'
  },
  {
    id: '126',
    url: '/photography/Ethan_s bday - 2026/DSC04025.JPG',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '127',
    url: '/photography/Ethan_s bday - 2026/DSC04035.JPG',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '128',
    url: '/photography/Ethan_s bday - 2026/DSC04062.JPG',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '129',
    url: '/photography/Ethan_s bday - 2026/DSC04078.JPG',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '130',
    url: '/photography/Ethan_s bday - 2026/IMG_1161.jpg',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '131',
    url: '/photography/Ethan_s bday - 2026/IMG_2596.jpg',
    location: 'Hamilton, Ontario',
    year: '2026'
  },
  {
    id: '132',
    url: '/photography/Ethan_s bday - 2026/IMG_1184.JPG',
    location: 'Hamilton, Ontario',
    year: '2026',
    tags: [
      { label: 'chayanth.me', href: 'https://chayanth.me/', x: 4, y: 55 },
      { label: 'aarondam.com', href: 'https://www.aarondam.com/', x: 13, y: 66 },
      { label: 'mikael.codes', href: 'https://www.mikael.codes/', x: 40, y: 57 },
      { label: 'ivyzhang.ca', href: 'https://www.ivyzhang.ca/', x: 61, y: 72 },
      { label: 'wcagas.com', href: 'https://wcagas.com/', x: 81, y: 63 }
    ]
  },
  {
    id: '133',
    url: '/photography/vancali - 2026/DSC04445.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '134',
    url: '/photography/vancali - 2026/DSC04578.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '135',
    url: '/photography/vancali - 2026/DSC04587.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '136',
    url: '/photography/vancali - 2026/DSC04593.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '137',
    url: '/photography/vancali - 2026/DSCN4432.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '138',
    url: '/photography/vancali - 2026/DSC04627.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '139',
    url: '/photography/vancali - 2026/DSC04700.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '140',
    url: '/photography/vancali - 2026/DSC04720.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '141',
    url: '/photography/vancali - 2026/DSCN4660.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '142',
    url: '/photography/vancali - 2026/DSC04901.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '143',
    url: '/photography/vancali - 2026/DSCN4628.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '144',
    url: '/photography/vancali - 2026/IMG_4145.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '145',
    url: '/photography/vancali - 2026/IMG_4177.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '146',
    url: '/photography/vancali - 2026/IMG_4251.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '147',
    url: '/photography/vancali - 2026/IMG_4298.JPG',
    location: 'Vancouver & California',
    year: '2026'
  },
  {
    id: '148',
    url: '/photography/Quebec - 2026/IMG_4601.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '149',
    url: '/photography/Quebec - 2026/IMG_4621.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '150',
    url: '/photography/Quebec - 2026/IMG_4630.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '151',
    url: '/photography/Quebec - 2026/IMG_4667.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '152',
    url: '/photography/Quebec - 2026/IMG_4745.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '153',
    url: '/photography/Quebec - 2026/IMG_4748.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '154',
    url: '/photography/Quebec - 2026/IMG_4752.jpg',
    location: 'Québec',
    year: '2026'
  },
  {
    id: '155',
    url: '/photography/Quebec - 2026/IMG_4755.jpg',
    location: 'Québec',
    year: '2026',
    tags: [{ label: 'oscarzhao.ca', href: 'https://www.oscarzhao.ca/', x: 49, y: 50 }]
  }
];
