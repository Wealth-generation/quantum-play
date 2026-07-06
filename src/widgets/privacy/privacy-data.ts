export interface LegalSection {
  number: number;
  heading: string;
  intro: string;
  items: string[];
}

export const privacySections: LegalSection[] = [
  {
    number: 1,
    heading: "Information We Collect",
    intro:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    items: [
      "Nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit.",
      "Voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.",
      "Cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Mollit anim id est laborum sed ut perspiciatis unde omnis iste natus error sit.",
    ],
  },
  {
    number: 2,
    heading: "How We Use Your Information",
    intro:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt.",
    items: [
      "Voluptatem accusantium doloremque laudantium totam rem aperiam eaque ipsa quae ab illo.",
      "Inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo nemo enim.",
    ],
  },
  {
    number: 3,
    heading: "Cookies and Tracking Technologies",
    intro:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati.",
    items: [
      "Cupiditate non provident similique sunt in culpa qui officia deserunt mollitia animi.",
      "Nam libero tempore cum soluta nobis eligendi optio cumque nihil impedit quo minus.",
      "Sapiente delectus ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis.",
    ],
  },
  {
    number: 4,
    heading: "Sharing and Disclosure of Data",
    intro:
      "Temporibus autem quibusdam et aut officiis debitis rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae itaque earum rerum hic tenetur.",
    items: [
      "Doloribus asperiores repellat libero qui ratione sequi nesciunt neque porro quisquam est.",
      "Dolorem ipsum quia dolor sit amet consectetur adipisci velit sed quia non numquam.",
      "Eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "Ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam.",
      "Quid ex ea commodi consequatur quis autem vel eum iure reprehenderit dolorem.",
    ],
  },
  {
    number: 5,
    heading: "Your Rights and Contact Information",
    intro:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.",
    items: [
      "Ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit consectetur.",
    ],
  },
];
