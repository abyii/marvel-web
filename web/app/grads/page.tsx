import { Metadata } from "next";
import dbClient from "../../utils/dbConnector";
import { Avatar, Window } from "@marvel/ui/ui";
import Link from "next/link";

const getGradsListGroupByQuarter = async () => {
  const worksThatHaveAllApprovedReports = await dbClient.work.findMany({
    where: {
        AND:{
            typeOfWork:"COURSE",
            Reports:{
                every:{
                    reviewStatus:"APPROVED"
                }
            }
        }
    },
    select:{
        courseCode:true,
        People:{
            select:{
                person:{
                    select:{
                        name:true,
                        slug:true,
                        profilePic:true,
                    }
                }
            }
        },
        Reports:{
            select:{
                createdAt:true,
                isOverview:true,
            }
        }
    }
  });

  const gradsListGroupByQuarter = worksThatHaveAllApprovedReports?.reduce((acc, work) => {
    const date = work.Reports.find(r=>r.isOverview)?.createdAt;
    if(!date){
        return acc;
    }
    const quarter = `${date.getFullYear()} Q${Math.floor(date.getMonth() / 3) + 1}`;
    
    if (!acc[quarter]) {
      acc[quarter] = [];
    }
    
    acc[quarter].push(...work.People.map(person => ({
      ...person.person,
      courseCode: work.courseCode || "N/A",
    })));
    return acc;
  }, {} as Record<string, Array<{name: string, slug: string, profilePic: string, courseCode: string}>>);

  return gradsListGroupByQuarter;
};

export const revalidate = 604800; // once a week

export const metadata: Metadata = {
  title: "Students Graduated from Student Track - from every Quarter. | UVCE MARVEL",
  description:
    "UVCE MARVEL's Student Track graduates across different Courses, from each Quarter.",
  openGraph: {
    type: "article",
    title: "Students Graduated from Student Track - from every Quarter. | UVCE MARVEL",
    description:
      "UVCE MARVEL's Student Track graduates across different Courses, from each Quarter.",
    images: [
      {
        url: "https://res.cloudinary.com/marvelweb/image/upload/v1678988482/Group_38_qrhqag.jpg",
        secureUrl:
          "https://res.cloudinary.com/marvelweb/image/upload/v1678988482/Group_38_qrhqag.jpg",
        type: "image/jpeg",
        width: 800,
        height: 800,
      },
    ],
  },
};

export default async function page() {
  const gradsListGroupByQuarter = await getGradsListGroupByQuarter();
// const gradsListGroupByQuarter = {
//   '2024 Q3': [
//     {
//       name: 'Deepthi Anand',
//       slug: 'deepthi-anand',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocIpY9BQzHhZmrmajCxmilP30TAMeGxcI1nXrMHje1ROsI-7vQ=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Asshray Sudhakar',
//       slug: 'asshray-sudhakar',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocK_zh0R3I1MjB8o6114PPg8P3u9BUIjnK5jzXHgeAfkZ2u5OUEn=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Saisuhasnaidu',
//       slug: 'saisuhasnaidu',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJN-q43GrDXNZ43u3-ejTw27DaXbklLc85bW-4kd72dPXUrP0d-=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Yashaswini Bhushan',
//       slug: 'yashaswini-bhushan',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLpNxhzm03JbI8ttYoN2bAlSRNPVMNc8WeBP-QhbKC8X9TIqg=s96-c',
//       courseCode: 'VFX-001'
//     },
//     {
//       name: 'Chuchi Gowda',
//       slug: 'chuchi-gowda',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJdgLAnjlJ0Gce6JZCFxQstN_XM5opj1Og7sRnfhDKngw=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Jeethan Tauro',
//       slug: 'jeethan-tauro',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocL_c38B05P1nbgs5wyOuhmS1orwKE2FP5k0LLzBoVK0=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Asshray Sudhakar',
//       slug: 'asshray-sudhakar',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocK_zh0R3I1MjB8o6114PPg8P3u9BUIjnK5jzXHgeAfkZ2u5OUEn=s96-c',
//       courseCode: 'VFX-001'
//     },
//     {
//       name: 'Sumanth G',
//       slug: 'sumanth-g',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocKbt9Qn-1n7mExPaRn76D-EuJuE3X6BjOuQJqNFl1DOz4dQIOlT=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2025 Q1': [
//     {
//       name: 'Yashaswini Bhushan',
//       slug: 'yashaswini-bhushan',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLpNxhzm03JbI8ttYoN2bAlSRNPVMNc8WeBP-QhbKC8X9TIqg=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Harshitha G',
//       slug: 'harshitha-g',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLc_YOKex2VWQ1ALdhnMpd4x-sLhLrLD7jcGq3QEN1IUF1GfA=s96-c',
//       courseCode: 'IOT-001'
//     },
//     {
//       name: 'Niranjana Reddy',
//       slug: 'niranjana-reddy',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocI03w6qOoEEWYsB5-6U15QbYV-6_oGIZPp9SUZjnkb1N4p_kA=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Harshitha Raj',
//       slug: 'harshitha-raj',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocL9UWpWR7WmkvBQcN1BE6PrOIQqbcT6NcsVK4bEUa7NCNRsYCHv=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Divyaprabha',
//       slug: 'divyaprabha',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJ97l35CRPLjREy8YGtZhTviVxDy4xMwg7H7W-Um35lA19L6g=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Sophia S',
//       slug: 'sophia-s',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJtl7n7A_8M301k2D5ELHXIGxClBIbSpHZFeen89qsBhf5jbA=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Monisha Krishnappa',
//       slug: 'monisha-krishnappa',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJFGo67J4Hb9WOdBOBHU6zSMlZAGdNnoq6WwOinaaKYwTzVcA=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Kankana Ghosh',
//       slug: 'kankana-ghosh',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLp-hP6woOUP-NJKWjcR59Oneo7XsKScj-Msqa_lNuqfTNNLQ=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Harsha T',
//       slug: 'harsha-t',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJWKGKejsz5pCZ-P0ougil36aGjxS9qX4QTJGrkh-Gsd3DgvL0=s96-c',
//       courseCode: 'IOT-001'
//     },
//     {
//       name: 'Varun Gowda v',
//       slug: 'varun-gowda-v',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxa7RfqR1NT2GDRLIDduyP-Mhq3y_IsWYpaHFPKV=s96-c',
//       courseCode: 'VFX-001'
//     },
//     {
//       name: 'Parthjit singh',
//       slug: 'parthjit-singh',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJXcezYvV64hPkLtwFYO6_FEFrhjGZn09RjKTmL6CTubMTNWQ=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Seema sm',
//       slug: 'seema-sm',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocKFajXILwD9mjFIpqnoZxjdIpCU4wIYlz1-aT86AIAp09ibTqk=s96-c',
//       courseCode: 'EV-RE-001'
//     }
//   ],
//   '2024 Q4': [
//     {
//       name: 'Asshray Sudhakar',
//       slug: 'asshray-sudhakar',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocK_zh0R3I1MjB8o6114PPg8P3u9BUIjnK5jzXHgeAfkZ2u5OUEn=s96-c',
//       courseCode: 'AIR-001'
//     },
//     {
//       name: 'R Vinay Kumar',
//       slug: 'r-vinay-kumar',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocLVgMRHB7-_pAATTo059fldjx34uuKxjrmGL5wm2Hrf=s96-c',
//       courseCode: 'D-P-001'
//     }
//   ],
//   '2023 Q2': [
//     {
//       name: 'Skanda Gowda',
//       slug: 'skanda-gowda-1',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxanLZessVrEpFJpfmQrasZbRxncilukxCOOSi63=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Anjal K Nair',
//       slug: 'anjal-k-nair',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxZXVuT-nTgygZAkkP4dIIDytTQEv8-hllWxK7Yg=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Mathew Abe',
//       slug: 'mathew-abe',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxb9YSDSks6uMLvbZt2yUYEr7Owv0YB_OBaRXw04MA=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Nithin Nithin',
//       slug: 'nithin-nithin',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxZl_OZePwde6botTE4C2fAtXJQBUg0HqpsGCS9o=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Samhitha Guruprasad',
//       slug: 'samhitha-guruprasad',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxaTiuy0elloqLn75GABEX1iN6gBUv-sLjsghO_2=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Vinutha V M',
//       slug: 'vinutha-v-m',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxa9_8ahA-4DoXaylfwXVACwG2BC_AasbSrt8DnC=s96-c',
//       courseCode: 'AI-ML-001'
//     },
//     {
//       name: 'maxus_red',
//       slug: 'maxusred',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxYR_PqzmStajM6DzZXNcBc1cZ5wsNSl24do8I1-ow=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Nikhil B N',
//       slug: 'nikhil-b-n-1',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxbS2043XUkOll45zHdSI0-Lgy2KyLZF7smCt0-IbnQ=s96-c',
//       courseCode: 'IOT-001'
//     },
//     {
//       name: 'Fathima Zahra',
//       slug: 'fathima-zahra',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxZQQJuy1pmuvaEinKfscerp-PtbblxBAVG4QgQ9=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'sahar mariam',
//       slug: 'sahar-mariam',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxY10nAtMy97B0I_IeKw4xoHKjtLjUa_83DVjlHOIQ=s96-c',
//       courseCode: 'AI-ML-001'
//     }
//   ],
//   '2024 Q2': [
//     {
//       name: 'Aditya Pattavardhanam',
//       slug: 'aditya-pattavardhanam',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocKgePb64I6QC-n40lajI8cFylTQXqd5s97J-7e1W_wa2ko=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Shanmukha D',
//       slug: 'shanmukha-d',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocKa7gNDoZAmR6HLniaqFr0Zao40bzMcKppv65VqLifWRw=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Dhruv',
//       slug: 'dhruv',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocIoE-d_KpJtZ2_QbRZgwjIjgH4wUSH_eneLGbyZw7Yv0qU=s96-c',
//       courseCode: 'IOT-001'
//     }
//   ],
//   '2023 Q1': [
//     {
//       name: 'Vinay Basavaraddi',
//       slug: 'vinay-basavaraddi',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AFdZucpaXhCJNxGcF-DVJjc3903_MODO1UV61ayhZtnRZA=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Shashank Gurunaga',
//       slug: 'shashank-gurunaga',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AFdZucpeWesJapdDcNpGpYKv3KAgx7H_qECz32aJhDGNDw=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Liyana Zuhur',
//       slug: 'liyana-zuhur',
//       profilePic: 'https://lh3.googleusercontent.com/a/AItbvmknZHv3e6A7xo18iSG07KLzB9q6m-CahNEsJwS2ZQ=s96-c',
//       courseCode: 'AI-ML-001'
//     },
//     {
//       name: 'Nischitha Tiwari',
//       slug: 'nischitha-tiwari',
//       profilePic: 'https://lh3.googleusercontent.com/a-/ACNPEu-V2Fi--7ouAeaSaFsnEsykyM_ipebNim1b6y4=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'darshan j',
//       slug: 'darshan-j',
//       profilePic: 'https://lh3.googleusercontent.com/a-/ACNPEu--QojGT2Lja-9BadQO-ryybJc9HNhbbGFKoAeS6A=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Sowmya KalaSindhu',
//       slug: 'sowmya-kalasindhu',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AFdZucrrIF3kh6v8AJ37oB8tF0sMyqlTl3L-5AbuCUnT8A=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Prajwal G',
//       slug: 'prajwal-g',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AFdZucq1KCIaJzus9SFWEjVv4izbkD-tME2-OqiuQKcp=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'shrushti bhalkiker',
//       slug: 'shrushti-bhalkiker',
//       profilePic: 'https://lh3.googleusercontent.com/a-/ACNPEu8CnA5-y1AzjsmkYkik9zOKyivMnOOR4KbKfz7t=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Shashank T S',
//       slug: 'shashank-t-s',
//       profilePic: 'https://lh3.googleusercontent.com/a/ALm5wu1HBUDJc4UfJMcV-av6xSZj8SSbOeFD2LLwesFQ=s96-c',
//       courseCode: 'AI-ML-001'
//     },
//     {
//       name: 'Bharath M',
//       slug: 'bharath-m',
//       profilePic: 'https://lh3.googleusercontent.com/a/AItbvmkgv-6D8f1WF6NDYdt6NCgwJj6SrbakWffIwJNw=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'K Lalrinchhana',
//       slug: 'k-lalrinchhana',
//       profilePic: 'https://lh3.googleusercontent.com/a/ALm5wu1rABEfjb4T2i5qSmwHNtEN8fpdM6Rs2N9G_eHS=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Somtea Khiangte',
//       slug: 'somtea-khiangte',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AFdZucqX4NYLjkDoeT1W77JYeTWT91qS5dk1Kl7Dkpk5AQ=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Bhavya Jonnagadla',
//       slug: 'bhavya-jonnagadla',
//       profilePic: 'https://lh3.googleusercontent.com/a/ALm5wu1maZTDMTuWl0jsOn-TLdmcha-U0A1PhlwUqMPV=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2023 Q4': [
//     {
//       name: 'Yeshwanth S',
//       slug: 'yeshwanth-s',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxY5qgZLUeYkckBarfgv0V869o3F499k8cULVaUvUQ=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Sohan Aiyappa',
//       slug: 'sohan-aiyappa',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocKr4PLzEiXKk1GH5OcDtdnAIhzG5C2lXKAqk7Ij7f2eZDQ=s96-c',
//       courseCode: 'AI-ML-001'
//     }
//   ],
//   '2023 Q3': [
//     {
//       name: 'Akanksh K',
//       slug: 'akanksh-k',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxb-bR70S-irsHWwSZdSnv9RczX-aGVo_YgttSXh=s96-c',
//       courseCode: 'IOT-001'
//     },
//     {
//       name: 'Jack And jill',
//       slug: 'jack-and-jill',
//       profilePic: 'https://lh3.googleusercontent.com/a/AAcHTtfef4SoPj3B6HWyLEne_atM0GZ7yt-_9Z3oyPtRZVfW=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'Sudeep Hegde',
//       slug: 'sudeep-hegde',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxZZiLesusx6ucu4Mh-4Pty276Utg2_D5u3ZJttt=s96-c',
//       courseCode: 'D-P-001'
//     },
//     {
//       name: 'Sujay Vikram G S',
//       slug: 'sujay-vikram-g-s',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14GitOGBEFqUYSplo02SK8pZkPe4DGcPySYSKZFip=s96-c',
//       courseCode: 'AI-ML-001'
//     },
//     {
//       name: 'Puneeth',
//       slug: 'puneeth',
//       profilePic: 'https://lh3.googleusercontent.com/a/AGNmyxZ8krhew8-89I3k3qaDWHLxe9RQxlroJ97IC68Q3w=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2022 Q2': [
//     {
//       name: 'Manjesh Patil',
//       slug: 'manjesh-patil',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14GhWivrGxDzuN41RnFPGs32LSpzmYKsK2KcpLM1VcQ=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Shaik Abdul Salam Batcha',
//       slug: 'shaik-abdul-salam-batcha',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14GjU5pgSZc4ThVRFBZJCZdaPwpSaCOWpq2PujamhGA=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'EN Sharan',
//       slug: 'en-sharan',
//       profilePic: 'https://lh3.googleusercontent.com/a/AATXAJzCkmnEU2rcATUW6P0LiRt94byB3qA7Yy0Vjgiu=s96-c',
//       courseCode: 'AI-ML-001'
//     },
//     {
//       name: 'Mahammad Riyaz',
//       slug: 'mahammad-riyaz',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14Gi-4BaHU_2-RIhRxVyp2n5XPTHhZSE0YNc1_U7byg=s96-c',
//       courseCode: 'D-P-001'
//     }
//   ],
//   '2024 Q1': [
//     {
//       name: 'Sai Venkat',
//       slug: 'sai-venkat',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocJhrI7rc8KS7JCAlyN3MTsFtek5T4gpmheQIDxSdX0hTw=s96-c',
//       courseCode: 'CL-CY-001'
//     },
//     {
//       name: 'shreya s u',
//       slug: 'shreya-s-u',
//       profilePic: 'https://lh3.googleusercontent.com/a/ACg8ocIPmCXNUND2Dx2BaKypO9XxXWCFDC3YEcWLoJLIF99xOg=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2022 Q1': [
//     {
//       name: 'Adeesh Padwalkar',
//       slug: 'adeesh-padwalkar',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14GjIzRa5L0lZeO1ig2AQD0CxHFtwui-jgrIsMYrVqg=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2022 Q3': [
//     {
//       name: 'Anusha L',
//       slug: 'anusha-l',
//       profilePic: 'https://lh3.googleusercontent.com/a/AATXAJwn-9i3sr80ya6NuSLO4OqB7Sx_tmKe44rRUUOb=s96-c',
//       courseCode: 'EV-RE-001'
//     },
//     {
//       name: 'Sujatha Bhat',
//       slug: 'sujatha-bhat',
//       profilePic: 'https://lh3.googleusercontent.com/a-/AOh14Ghc0im4uC71yBwQUUwduwjI4C5y0YA84rD2jTl_8IM=s96-c',
//       courseCode: 'CL-CY-001'
//     }
//   ],
//   '2022 Q4': [
//     {
//       name: 'Bhavid A',
//       slug: 'bhavid-a',
//       profilePic: 'https://lh3.googleusercontent.com/a/ALm5wu0WR2QOVsRvnREm_m-xzRP9-GShmUb6_-IrXrg80g=s96-c',
//       courseCode: 'IOT-001'
//     }
//   ]
// }

  // console.log(gradsListGroupByQuarter);
  const sortedQuarter = Object.keys(gradsListGroupByQuarter).sort((a, b) => b.localeCompare(a));
  return (
    <Window className={"pt-5 md:pt-12 pb-40"}>
      <div className="w-full max-w-5xl flex flex-col p-5">
        <h1 className="text-3xl md:text-5xl px-3">
          <span className="text-p-4 dark:text-p-5">{"Student Track / "}</span>
          <span className="text-p-0 dark:text-p-9">{"Graduates"}</span>
        </h1>
        <p className="w-full text-lg py-12 text-p-0 dark:text-p-9 px-3">
          {"UVCE MARVEL's Student Track Graduates across different Courses, from each Quarter."}
        </p>
        <div className="flex flex-col w-full gap-5 flex-wrap mt-5">
          {sortedQuarter.map((quarter, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-5 border-b border-p-5 dark:border-p-2 pb-10">
                <div className="md:min-w-60">
                    <h2 className="text-2xl md:text-3xl px-3">
                        {quarter}
                    </h2>
                </div>
                <div className="flex-1 flex flex-wrap gap-5">
                    {gradsListGroupByQuarter[quarter].map((grad, i) => (
                        <Link href={`/u/${grad.slug}/works`} key={i} className="flex items-center gap-2 hover:bg-p-8 dark:hover:bg-p-3 p-2 rounded-full transition-colors bg-p-9 dark:bg-p-2">
                            <Avatar src={grad.profilePic} alt={grad.name} />
                            <p className="text-lg pr-2">{grad.name}&nbsp;<span className="text-p-4 dark:text-p-5">from</span>&nbsp;{grad.courseCode}</p>
                        </Link>
                    ))}
                </div>
            </div>
          ))}
        </div>
      </div>
    </Window>
  );
}
