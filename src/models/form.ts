export interface FormField {
  id: string;
  name: string;
  prompt: string;
  type: 'text' | 'number' | 'date' | 'choice';
  options?: string[];
  answer?: string;
}

export interface Form {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormInstance {
  id: string;
  form: Form;
  createdAt: Date;
  currentFieldIndex: number; // this is like component specific 
}

  /*
    ************* THINKING TRAP FORM ****************
    3-6 Thinking Traps
    Reflection on where those traps trigger
    Affirmations for those thinking traps
    *************************************************
    *************** EXPANDERS FORM ******************
    People whose achievements and qualities align with
    your desires. Recognize them to tap into their
    energy and mindset, expanding self belief.
    - People at a distance
    - People in your orbit (1 degree removed)
    - People in your circle
    *************************************************
    *************** CORE VALUES FORM ****************
    - What was a time you were at your best and why
    - How would you explain yourself to someone new
    - Who is the happiest person you know
    - Are there qualities in others that you dislike
    - Who has inpired you, what qualities in specific

    - List out the words or phrases that capture you
    - These will be your core values
    - 1 wide, 3 tall, 1 wide, 1 wide
    *************************************************
    *************** DREAM GOAL FORM *****************
    - Dream Goal
    - How does this impact my life
    - What specific steps do I need to take for this
    - Assign days/times to work on this goal
    *************************************************
    *************** ACTIVITIES FORM *****************
    - Activities, Start, Stop, Continue for each:
  
    - Wealth, Cash Flow / Investments, Things You Own
    - Income Type / Sources, Net Worth / Savings
    - Awards / Achievements, Giving, Legacy
    - Groups / Communities, Breakthroughs / Books
    - [Immediate Family, Network, Friends, Social Group
    - Significant Other / Children], [Habits, Rituals
    - Events, Highest Beliefs, Spiritual Connection]
    - [State of Health, Nutrition, Fitness, Longevity
    - Adventure], [Joy, Educational Growth,
    - Travel, Experiences, Retreats] 
    *************************************************
    *************** ASPIRATIONS FORM ****************
    - Create a 5 year plan for the following
    - Significant Other / Children
    - Immediate Family
    - Network
    - Friends
    - Social Group
    ----------------------
    - Spiritual Connection / Growth
    - Habits
    - Rituals
    - Events
    - Highest Self
    ----------------------
    - Joy
    - Educational Growth
    - Travel
    - Experiences
    - Retreats
    *************************************************
    *********** CHALLENGES TO GIFT FORM *************
    - Challenge
    - How it made me feel
    - Possible Gift / Opportunity / Lesson
    x N (6)
    *************************************************
    ******** PERSONAL ANNUAL REVIEW FORM ************
    - What exists in your life today that didnt last year
    - What did you change your mind on
    - What or whom energized you
    - What or whom drained you
    - Who or what held you back from achieving your goals
    - What did you not do out of fear
    - What were your significant successes and failures
    - What were your key learnings
    *************************************************
    ********* MINI ANNUAL REFLECTION FORM ***********
    - This last year felt
    - One thing I'm grateful for from this past year is
    - One thing I'm proud of accomplishing this past year is
    - One new thing I learned about myself is
    - One good new habit I integrated into my life last year is
    - One bad habit I left behind last year is
    - A memorable experience or moment from last year is
    Rose - Bud - Thorn
    *************************************************
    ******** PERSONAL ANNUAL PLANNING FORM **********
    - How do you want the upcoming year to feel
    - What do you want to leave behind
    - Who do you want to become
    - What are you most looking forward
    *************************************************
  */
