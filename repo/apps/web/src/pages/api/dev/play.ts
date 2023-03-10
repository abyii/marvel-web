import { NextApiRequest, NextApiResponse } from "next";
import dbClient from "../../../utils/dbConnector";
import { People, ScopeEnum, TypeOfWork } from "database";

const data = [
  {
    name: "Abhishek Y",
    email: "abhishekyanjarappa@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GjYgWTQlL3ujvOolSvq_9997m9kLqAVfZO1bq6HHg=s96-c",
    id: "105889498257809539120",
    currentInsCourse: {},
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    slug: "abhishek-y",
  },
  {
    name: "Marvel web",
    email: "uvcemarvelweb@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwyi6b-uP4yh4_lJpiUvJmvH2DozjvBIOaKBddx=s96-c",
    id: "106312575807115239025",
    currentInsCourse: [
      "AI-ML-001",
      "IOT-001",
      "D-P-001",
      "EV-RE-001",
      "CL-CY-001",
    ],
    currentRole: "INS",
    slug: "marvel-web",
    currentStuCourse: "NA",
  },
  {
    name: "Adeesh Padwalkar",
    email: "adeeshpadwal@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GjIzRa5L0lZeO1ig2AQD0CxHFtwui-jgrIsMYrVqg=s96-c",
    id: "112259034941075238160",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "adeesh-padwalkar",
  },
  {
    name: "Keerthi N C",
    email: "keerthireddync@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgzJLD59XYelYhB9g7n2VjqMCpi-VqONlX17pWvEw=s96-c",
    id: "107738130945586355601",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "keerthi-n-c",
  },
  {
    name: "VISHAL VINAYRAM",
    email: "vishalvinayram5432@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gjh8XCH9LUeJGPKvvJPbyRpw8M-19qkcJBWmyY=s96-c",
    id: "106364624677601940985",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "vishal-vinayram",
  },
  {
    name: "Girish Bharadwaj",
    email: "girishkulkarni351@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwTFg2QcAHrlbQlwjJq5718MV-LXyTeHAn_XXJN=s96-c",
    id: "109899237031146660065",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "girish-bharadwaj",
  },
  {
    name: "Manish K B",
    email: "manishkb222@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJyt_qIYQijcvnCDFpy5ylHAX8EbIPQ0x4wisVL_=s96-c",
    id: "104998706990791651743",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "manish-k-b",
  },
  {
    name: "Prajwal A",
    email: "awarprajwal@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwWeKRPvlT6Uw4HHLdRyA4i77gRsCIxkump0PEh=s96-c",
    id: "104873260554259260437",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "prajwal-a",
  },
  {
    name: "Anusha L",
    email: "anushalnayaka789@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwn-9i3sr80ya6NuSLO4OqB7Sx_tmKe44rRUUOb=s96-c",
    id: "112762218547815767821",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "anusha-l",
  },
  {
    name: "Mahammad Riyaz",
    email: "mahammadriyaz28086@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gi-4BaHU_2-RIhRxVyp2n5XPTHhZSE0YNc1_U7byg=s96-c",
    id: "105852021669447036706",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "mahammad-riyaz",
  },
  {
    name: "bhargav adya l",
    email: "bhargav.adya.510@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhqFcgnnsfxaGieR2Pb822y6Lh9LlVFxiLjVcJw7A=s96-c",
    id: "104450960609424011226",
    currentRole: "INS",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: ["AI-ML-001"],
    slug: "bhargav-adya-l",
  },
  {
    name: "Manjesh Patil",
    email: "manjeshpatil18@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhWivrGxDzuN41RnFPGs32LSpzmYKsK2KcpLM1VcQ=s96-c",
    id: "104782836899613634191",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "manjesh-patil",
  },
  {
    name: "Vachan K",
    email: "vachank777@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJzkqPIddR2Nucd_rAze7gNjl14W_9tCYjHncEX0=s96-c",
    id: "103650561346425653863",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "vachan-k",
  },
  {
    name: "Shreekanth Dash",
    email: "shreekanthdash4@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gg0NeL1XQCHw92Xv7PTCY4v9msfT_MeC2Sh8akifw=s96-c",
    id: "106098210221713791744",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "shreekanth-dash",
  },
  {
    name: "Sujatha Bhat",
    email: "sujathabhat2002@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Ghc0im4uC71yBwQUUwduwjI4C5y0YA84rD2jTl_8IM=s96-c",
    id: "109773147484993338864",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "sujatha-bhat",
  },
  {
    name: "Meghana K S",
    email: "meghana.suresh2307@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJxokNRXpbonGIEffDm9lW8flg-yY_LUSgbxRvrm=s96-c",
    id: "109660455535670337758",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "meghana-k-s",
  },
  {
    name: "Kalyan K R",
    email: "kalyankr@ieee.org",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhD8OkMuyMsj6q1sxwTDVzNdi30uzHOhFtbtLvk=s96-c",
    id: "111866020575535711665",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "kalyan-k-r",
  },
  {
    name: "Nischal Vishwanath",
    email: "nischal.vishwanath23@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJxrIcqdaeEgqlt7bC0dhsnXqVp_ebImZqvkzdWAog=s96-c",
    id: "107338367233922548232",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "nischal-vishwanath",
  },
  {
    name: "mayur bhat",
    email: "mayurbhat2082001@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GjZ30u0755omsXxzYzVWmQznqBtUNO4UHaz3jX9cw=s96-c",
    id: "109584008564783680632",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "mayur-bhat",
  },
  {
    name: "EN Sharan",
    email: "sharanen27@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJzCkmnEU2rcATUW6P0LiRt94byB3qA7Yy0Vjgiu=s96-c",
    id: "109330081501351077846",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "en-sharan",
  },
  {
    name: "Kushal",
    email: "kushalsangnalmat@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwnq0lCx5miTa73l1zzP-3DayG8UCx9HIC1YHZcKA=s96-c",
    id: "104388636569845587368",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "kushal",
  },
  {
    name: "Shrishti Bekal m",
    email: "shrishtibekalm@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwnUxzfUKQV9_G1JMg1oKrv9jzTy3YSHK6mcI9d=s96-c",
    id: "106004747275695513245",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "shrishti-bekal-m",
  },
  {
    name: "Adrian P Isaac",
    email: "apisaac85@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJzHUOMMrbfb06HxDK8YAdmnziBAzBwcKR4OqhDf=s96-c",
    id: "107216320524078999860",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "AI-ML-001",
      "IOT-001",
      "D-P-001",
      "CL-CY-001",
      "EV-RE-001",
    ],
    slug: "adrian-p-isaac",
  },
  {
    name: "Veerabhadra Kumbar",
    email: "rajukumbar062001@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gj0PXNGHw3uIau_ZHqd_m4umjhG6L2URCpfuoqgrg=s96-c",
    id: "115909686327300868946",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "veerabhadra-kumbar",
  },
  {
    name: "Bhooshankumar",
    email: "bhooshankumar13@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgzFwp2Uw32S69c75rsRJNzPKv2W8LGsChVyjgJcBo=s96-c",
    id: "117351210451362038471",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "bhooshankumar",
  },
  {
    name: "Yuan Biju",
    email: "yuankavumkal652@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgdbuLTfC2iggUdfEUpBL-v3XadpjLuxDkw-IwF=s96-c",
    id: "113351026631427985030",
    currentRole: "INS",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: ["EV-RE-001", "IOT-001"],
    slug: "yuan-biju",
  },
  {
    name: "Samuel Noel",
    email: "noelsamuel2002@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwo3v78sdUABS1if0kag_jZ00GMMao8LI8HvdPR=s96-c",
    id: "110741997890695011600",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "samuel-noel",
  },
  {
    name: "Shaik Abdul Salam Batcha",
    email: "shaiksalam2002@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GjU5pgSZc4ThVRFBZJCZdaPwpSaCOWpq2PujamhGA=s96-c",
    id: "104838778419284273154",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "shaik-abdul-salam-batcha",
  },
  {
    name: "Karthik K S",
    email: "karthikkssuresh@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhQIwYrQLivt3Ze7ACdauqCYFQ0lP40xiesXZDPSQ=s96-c",
    id: "107209715303575027881",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["CL-CY-001"],
    slug: "karthik-k-s",
  },
  {
    name: "Yashika Gulati",
    email: "yashika.carmel@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJz_UBSAC8xa60fNc1gweyoRlEMZUviA64XZsA4S=s96-c",
    id: "113732646771140143210",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "yashika-gulati",
  },
  {
    name: "Mohammed Fouzan",
    email: "mohammed.fouzan6767@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GijHfnhaYGTZp3Bg1RQ3XKObLHZXfiWnDl_85vl=s96-c",
    id: "102672692120182831277",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["IOT-001"],
    slug: "mohammed-fouzan",
  },
  {
    name: "Pratheeth A",
    email: "pratheeth596@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJx9RbGw22rcsgx2LFu56EA3H0KP268i6BlbfTVh=s96-c",
    id: "117700306203140562851",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["CL-CY-001", "AI-ML-001"],
    slug: "pratheeth-a",
  },
  {
    name: "Satish A G",
    email: "satishag87@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gik9gXtu0Zm_vHwVlVPU4PpjfepNOmCGeitqINC=s96-c",
    id: "108819123288118516683",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "AI-ML-001",
      "D-P-001",
      "IOT-001",
      "CL-CY-001",
      "EV-RE-001",
    ],
    slug: "satish-a-g",
  },
  {
    name: "anupama hegde",
    email: "anupamahegde2002@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Ghw7GJ-ukYm0QYzxL4ALusylcPEIaCwxePEhapCpQ=s96-c",
    id: "112056121845526655424",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "AI-ML-001",
      "IOT-001",
      "D-P-001",
      "CL-CY-001",
      "EV-RE-001",
    ],
    slug: "anupama-hegde",
  },
  {
    name: "Vakesan M",
    email: "not.vakesan@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gglir4nDNDf1ooYgznQ9OSyomqM7tYHuznIutxG=s96-c",
    id: "113672912341075922072",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "D-P-001",
      "IOT-001",
      "CL-CY-001",
      "EV-RE-001",
      "AI-ML-001",
    ],
    slug: "vakesan-m",
  },
  {
    name: "Abhiram Avadhanam",
    email: "avadhanam.abhiram@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwOoMw-OzRVyp6q9r71VDwLgCXihDbnk_J8gnt_=s96-c",
    id: "110756816245566323271",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["AI-ML-001"],
    slug: "abhiram-avadhanam",
  },
  {
    name: "swaminathan s",
    email: "swaminathansmes3@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GiKK5ZpxTvj6p9Qe99txN3dxoUlvkUMXXd_u-lqzg=s96-c",
    id: "111393496871530596330",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["AI-ML-001"],
    slug: "swaminathan-s",
  },
  {
    name: "Anish Krishnakumar",
    email: "anish121201@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhhvKyHpnMKaN7q0ViRpvIdy_WcUjAConHc-sOf-_A=s96-c",
    id: "105448359492493887798",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "AI-ML-001",
      "IOT-001",
      "D-P-001",
      "CL-CY-001",
      "EV-RE-001",
    ],
    slug: "anish-krishnakumar",
  },
  {
    name: "Varsha Bhat",
    email: "bhatvarsha2120@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gg1uNe8MacQSQDiJbevxoC-3aBesOzdb7dSHDRM41w=s96-c",
    id: "105780578840830411111",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["IOT-001"],
    slug: "varsha-bhat",
  },
  {
    name: "S Ruchitha Yadav",
    email: "sruchitha23@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwaZQZPM9ZVHHyD5jJKOCpYQ7oieg4irg8gtYNl=s96-c",
    id: "107287550125116073757",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["IOT-001"],
    slug: "s-ruchitha-yadav",
  },
  {
    name: "Manu Govind V",
    email: "manuvazhunnavar2012@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgfAp5ZlmAqLuwmpOaJ1zQ1msnFdytwdi5KA4KIa4A=s96-c",
    id: "114580095635674656944",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["D-P-001"],
    slug: "manu-govind-v",
  },
  {
    name: "Shrinidhi P",
    email: "shrinidhifeb22@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhJ0c3e1EwXkrl1NPsF_oYR64DzKKd2SH2fpOHmwA=s96-c",
    id: "117834088415728388987",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["EV-RE-001"],
    slug: "shrinidhi-p",
  },
  {
    name: "Vinutha V",
    email: "vinuthakardakal@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gi_OzBXUNYP4ZlXrTPAWmZ5nrEi_JC3O14eQMwK4vM=s96-c",
    id: "106551161776507692450",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["EV-RE-001", "D-P-001"],
    slug: "vinutha-v",
  },
  {
    name: "Neha H",
    email: "nehajyothi11@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgjYKcqbRLPONpqY88F0SIzt6gfIb49FxKHtNtIaQ=s96-c",
    id: "104074801196855229319",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["EV-RE-001", "IOT-001"],
    slug: "neha-h",
  },
  {
    name: "Yogesh G",
    email: "yogesh2747scif@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gh8F6MwPY6CdcZIEiy8sjEDFlk52ghGCrZGikD0Tg=s96-c",
    id: "116069656310827194456",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["D-P-001"],
    slug: "yogesh-g",
  },
  {
    name: "Deepa A Paraganve",
    email: "paraganvedeepa2000@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gi3gFsYqCpmLSdtDtZaorFGUgmsCyWgSK1YNKaaGA=s96-c",
    id: "113659114983898332739",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "deepa-a-paraganve",
  },
  {
    name: "UVCE Marvel",
    email: "uvcemarvel@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJySt6edcOYauNgnMHWorFeArFd82QF9Ixowzno=s96-c",
    id: "101651589274766468524",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: [
      "AI-ML-001",
      "IOT-001",
      "D-P-001",
      "CL-CY-001",
      "EV-RE-001",
    ],
    slug: "uvce-marvel",
  },
  {
    name: "Rahul Ramesh",
    email: "rahul.sandli.ramesh@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgABoFGE2dJkdS2z_niYUa6T_du12P53RcX7puNoQ=s96-c",
    id: "104389269008133811440",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["D-P-001"],
    slug: "rahul-ramesh",
  },
  {
    name: "Sujay Vikram G S",
    email: "sujayvikramuvce@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GitOGBEFqUYSplo02SK8pZkPe4DGcPySYSKZFip=s96-c",
    id: "117195121744424483017",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "sujay-vikram-g-s",
  },
  {
    name: "mohammed hamza",
    email: "xeomatrix369@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gjg-gYDlGqhkeYDF1C3zXXFWs3FjpAMy_cXygB5=s96-c",
    id: "106699868170952763516",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "mohammed-hamza",
  },
  {
    name: "Abhilash Bhat",
    email: "abhilashbhatt69@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJz_yqoZDZyg6-Y-Sy4izKSmG8xD6gZoN_rhkTsS=s96-c",
    id: "110383941214781102180",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["IOT-001"],
    slug: "abhilash-bhat",
  },
  {
    name: "Ananya S R",
    email: "ananyacsebtech@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwBCftG3oN6YJ40Q9ekJFYf2Qx4NAB-ayr2OhOt=s96-c",
    id: "106320125773839574987",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["AI-ML-001"],
    slug: "ananya-s-r",
  },
  {
    name: "Mohammed Nowfal",
    email: "mohammednowfal7228@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14Gh79V1CJfzcGeg4-v_GdhYBh5anxrdcHsi2NN8asQ=s96-c",
    id: "109921042053760259478",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["EV-RE-001"],
    slug: "mohammed-nowfal",
  },
  {
    name: "Vineeth Raghavan",
    email: "vineeth.raghavan02@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GgP449w0p6Zbk59VzKoI3uGzkCvqNT7LQG0PaIH=s96-c",
    id: "106954092090148614616",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["CL-CY-001"],
    slug: "vineeth-raghavan",
  },
  {
    name: "Meghashyama Aithal",
    email: "meghuaithal@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhFxJ6I4Jf8dF-ym2L72KKOgjCOitVCwT9QrlhjjQ=s96-c",
    id: "113219887243549525861",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["CL-CY-001"],
    slug: "meghashyama-aithal",
  },
  {
    name: "Greeshma Sharma",
    email: "grsharma2003@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AOh14GhUiHIkw_csgoA9jOusGcEbjS943FFvS4G8LroDpA=s96-c",
    id: "110953451063544920497",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["AI-ML-001"],
    slug: "greeshma-sharma",
  },
  {
    name: "Pranava Shastry",
    email: "pranava.shastry@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJzMlWk4PJX1jHD9TwBHiBjlI-PgA6nP2nelu3gt=s96-c",
    id: "111226446537579190660",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["D-P-001"],
    slug: "pranava-shastry",
  },
  {
    name: "Nitin Reddy",
    email: "nitin.reddy340@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AATXAJwIwQTS71dVPVB7kn9oNnSaxgpefzVLGLnz0VntnzA=s96-c",
    id: "116256864109914097917",
    currentRole: "INS",
    currentStuCourse: "NA",
    currentInsCourse: ["EV-RE-001"],
    slug: "nitin-reddy",
  },
  {
    name: "Prajwal G",
    email: "prajwal.gkvk@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucq1KCIaJzus9SFWEjVv4izbkD-tME2-OqiuQKcp=s96-c",
    id: "106308355386786384719",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "prajwal-g",
  },
  {
    name: "Shashank Gurunaga",
    email: "shashankgurunaga@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucpeWesJapdDcNpGpYKv3KAgx7H_qECz32aJhDGNDw=s96-c",
    id: "113582005841395901943",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "shashank-gurunaga",
  },
  {
    name: "Sushmita Chougala",
    email: "sushmitachougala5@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucpCcb60v1cngIElTctoX66P3q7MeY8ZN00Phcef5Q=s96-c",
    id: "117085362469246509239",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "sushmita-chougala",
  },
  {
    name: "Abhinav Pandey",
    email: "abhinavpandeyjee@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucolE8K8sKCwFXMPgpihy_Z-06v33il0Gvi46_X8hQ=s96-c",
    id: "113689317704523733495",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "abhinav-pandey",
  },
  {
    name: "Vinay Basavaraddi",
    email: "vinay.basavaraddi@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucpaXhCJNxGcF-DVJjc3903_MODO1UV61ayhZtnRZA=s96-c",
    id: "117268979319917549320",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "vinay-basavaraddi",
  },
  {
    name: "Bharath M",
    email: "bharathtech15@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmkgv-6D8f1WF6NDYdt6NCgwJj6SrbakWffIwJNw=s96-c",
    id: "102366693772660356903",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "bharath-m",
  },
  {
    name: "Somtea Khiangte",
    email: "somteakhiangte02@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucqX4NYLjkDoeT1W77JYeTWT91qS5dk1Kl7Dkpk5AQ=s96-c",
    id: "106750292366256981673",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "somtea-khiangte",
  },
  {
    name: "Liyana Zuhur",
    email: "liyana.zuhur@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmknZHv3e6A7xo18iSG07KLzB9q6m-CahNEsJwS2ZQ=s96-c",
    id: "106650024370826124534",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "liyana-zuhur",
  },
  {
    name: "deepak panwar",
    email: "deepaksinghpanwar111@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucpo8HwURngYDs3z9aZIV_CVN8J1nAKY_j6C5Qc8yA=s96-c",
    id: "102273199884430853787",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "deepak-panwar",
  },
  {
    name: "vishnu VB",
    email: "vishnuvb243@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucrysa_QkqTX61QpRxA7U7Vrm1Ty0M5DeO5Ut7ritw=s96-c",
    id: "109202438314757723154",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "vishnu-vb",
  },
  {
    name: "Utkarsh Raghunath",
    email: "utkarshraghu9@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmmVrxm7vHc5Nzu8YqCXDTS7dXdynkRUvDMIoO7j9cA=s96-c",
    id: "116457774364774773301",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "utkarsh-raghunath",
  },
  {
    name: "Shreyash Suryawanshi",
    email: "shreyashsuryawanshi926@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucpoa_X6_1oW9-58eH-d1FflAI_60dj_utI5pdV0=s96-c",
    id: "107774299533928911859",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "shreyash-suryawanshi",
  },
  {
    name: "Ganga Lokesh V",
    email: "lokeshjinkala333@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmk21jocSs60Nas-_Oa_2-goZq08Pw2ZY-TjxsC0=s96-c",
    id: "105071756002333883338",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "ganga-lokesh-v",
  },
  {
    name: "Kiran G",
    email: "kg01062003@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmkM9LbFl7VXWBSKbTs2JFNbPqMg-B4Uu7Pge9sY=s96-c",
    id: "101115196791195739949",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "kiran-g",
  },
  {
    name: "Sowmya KalaSindhu",
    email: "husoumya@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/AFdZucrrIF3kh6v8AJ37oB8tF0sMyqlTl3L-5AbuCUnT8A=s96-c",
    id: "100318100200674568635",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "sowmya-kalasindhu",
  },
  {
    name: "Bhuvan K",
    email: "bhuvankoonur68630@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/AItbvmkA6hKrLs8saguy81650lp9wnXSgvxxoD1DcYqlKQ=s96-c",
    id: "100964126036380601327",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "bhuvan-k",
  },
  {
    name: "darshan j",
    email: "jdarshan098@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu--QojGT2Lja-9BadQO-ryybJc9HNhbbGFKoAeS6A=s96-c",
    id: "110997097116578982620",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "darshan-j",
  },
  {
    name: "Suresh",
    email: "sureshpatel9210@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu0-Ei0IPPg5XPgA1PAcDAvU_a8TJR-L8I8UE74w=s96-c",
    id: "115226457739720150827",
    currentRole: "STU",
    currentStuCourse: "EV-RE-001",
    currentInsCourse: {},
    slug: "suresh",
  },
  {
    name: "Shreyas Das",
    email: "shreyasdas54@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu8k-Iqauim5tK2C3F3eBwamy8oHJmtppcpMvgDK=s96-c",
    id: "105344701691985404372",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "shreyas-das",
  },
  {
    name: "Harshvardhan Patil",
    email: "harshvardhanhpatil55@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu8-8Anpc1lgNi1mt0TVz-AtORtrnRe357QtDVp0MQ=s96-c",
    id: "103111613411002639375",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "harshvardhan-patil",
  },
  {
    name: "shrushti bhalkiker",
    email: "ssshrushtib2021@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu8CnA5-y1AzjsmkYkik9zOKyivMnOOR4KbKfz7t=s96-c",
    id: "116401292645131885948",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "shrushti-bhalkiker",
  },
  {
    name: "Vikas V 0330",
    email: "vikasuvcecs@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu2ZEDOd6xCab3eaUQwtC-ZG88c1zeUGrxvMzyEf=s96-c",
    id: "105273707812534403739",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "vikas-v-0330",
  },
  {
    name: "Nischitha Tiwari",
    email: "nischithatiwari833@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu-V2Fi--7ouAeaSaFsnEsykyM_ipebNim1b6y4=s96-c",
    id: "101799795740567039279",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "nischitha-tiwari",
  },
  {
    name: "Saritha AC",
    email: "sarithaac1753@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu1QlRB6U7o_zbtK56RmwNM5cToQkFOKyPDQ9MFL=s96-c",
    id: "108904133206275378059",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "saritha-ac",
  },
  {
    name: "Abhishek KN",
    email: "knabhishek02@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a-/ACNPEu8_eITwVxFXqoEahmlRPEY80nUOIIRMDt_H7AJNYQ=s96-c",
    id: "107576776611671121534",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "abhishek-kn",
  },
  {
    name: "Bhavid A",
    email: "bhavidashok@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu0WR2QOVsRvnREm_m-xzRP9-GShmUb6_-IrXrg80g=s96-c",
    id: "118410162464738169067",
    currentRole: "STU",
    currentStuCourse: "IOT-001",
    currentInsCourse: {},
    slug: "bhavid-a",
  },
  {
    name: "K Lalrinchhana",
    email: "k.lalrinchhana@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu1rABEfjb4T2i5qSmwHNtEN8fpdM6Rs2N9G_eHS=s96-c",
    id: "102323299324943316410",
    currentRole: "STU",
    currentStuCourse: "D-P-001",
    currentInsCourse: {},
    slug: "k-lalrinchhana",
  },
  {
    name: "Shashank T S",
    email: "shashankts123@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu1HBUDJc4UfJMcV-av6xSZj8SSbOeFD2LLwesFQ=s96-c",
    id: "105816042342668695665",
    currentRole: "STU",
    currentStuCourse: "AI-ML-001",
    currentInsCourse: {},
    slug: "shashank-t-s",
  },
  {
    name: "Bhavya Jonnagadla",
    email: "bhavyajonnagadla01@gmail.com",
    profilePic:
      "https://lh3.googleusercontent.com/a/ALm5wu1maZTDMTuWl0jsOn-TLdmcha-U0A1PhlwUqMPV=s96-c",
    id: "117751499077038425046",
    currentRole: "STU",
    currentStuCourse: "CL-CY-001",
    currentInsCourse: {},
    slug: "bhavya-jonnagadla",
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    data.forEach(async (user) => {
      await dbClient.people.create({
        data: {
          email: user.email,
          googleId: user?.id,
          name: user.name,
          profilePic: user.profilePic,
          slug: user.slug,
          scope: {
            create: [
              { scope: "PROFILE" },
              ...(user?.currentRole == "INS"
                ? [{ scope: "CRDN" as ScopeEnum }]
                : []),
            ],
          },
          ...(user?.currentRole == "STU"
            ? {
                Works: {
                  create: {
                    work: {
                      create: {
                        typeOfWork: "COURSE" as TypeOfWork,
                        course: {
                          connect: {
                            courseCode: user?.currentStuCourse,
                          },
                        },
                        totalLevels: 3,
                      },
                    },
                    role: "AUTHOR",
                    status: "ACTIVE",
                  },
                },
              }
            : null),
        },
      });
    });

    // data.forEach(user=>)
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).send("Error");
  }
}
