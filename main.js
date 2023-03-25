//SUPABASE IMPORT AND API KEYS
  import { SupabaseClient } from '@supabase/supabase-js';

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);

  //Initialize a variable that is used in the function selected word
  let selectedWord = '';

//EXECUTED FUNCTIONS

  //Identify if there is an active session or not to render a specific section on the web App
  (async () => {
    try {
      const user = await getLogInUser();
      //Section Rederer
      sectionRenderer(user, displaySignOutButton, signOut, navigateTo, processText);
    } catch (error) {
      console.error("Error:", error);
    }
  })();


// GET NECESSARY ELEMENTS BY ID ======================================================================================================>

  // Login buttons
  const signUpButton = document.getElementById('signUpButton');
  const signInButton = document.getElementById('signInButton');

  //Infinite Histories buttons for texts
  const buttonIgnoreWord = document.getElementById("ignore-word");
  const buttonKnownWord = document.getElementById("known-word");
  const buttonMarkedWord = document.getElementById("marked-word");


//FUNCTIONS FOR THE TEXTS SECTION ======================================================================================================>

  // SELECT A WORDS OF A TEXT------->
  function selectWord(event) {

  // Remove 'selected' class from all word elements
  const wordElements = document.querySelectorAll('.word');
  wordElements.forEach(wordElement => {
    wordElement.classList.remove('selected');
  });

   // Add 'selected' class to the clicked element
   event.target.classList.add('selected');   

   selectedWord = event.target.textContent;
  
  console.log('Selected word: ' + selectedWord);
  }

  //TURN A WORD YELLOW IF IT IS MARKED BY THE USER------->
  async function toggleHighlight(event) {
      event.target.classList.toggle('highlighted');
      const word = event.target.textContent;
      const color = event.target.classList.contains('highlighted') ? 'yellow' : '#89CFF0';
      await saveWord(word, color);
  }

  //PROCESS THE ENTIRE TEXT TO IDENTIFY INDIVIDUAL WORDS AND ADD AN EVENT LISTENER TO EVERY ONE OF THEM ------->
  function processText(text) {
      const textContainer = document.getElementById('textContainer');
      const words = text.split(' ');

      words.forEach((word, index) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'word';
          wordSpan.textContent = word;
          wordSpan.addEventListener('click', selectWord);
          textContainer.appendChild(wordSpan);

          if (index < words.length - 1) {
              const spaceSpan = document.createElement('span');
              spaceSpan.textContent = ' ';
              textContainer.appendChild(spaceSpan);
          }

      });
  }

  //SAVE WORDS TO THE DB ------->
  async function saveWord(word, color) {
    try {
      const response = await supabase
        .from('words')
        .insert([{ text: word, color: color }]);
        console.log('Saved word:');

        console.log('Response:', response);
    console.log('Data:', response.data);
    console.log('Error:', response.error);

      if (response.error) {
        throw error;
      }


  } catch (error) {
  console.error('Error saving word to the database:', response.error.message);
  }
  }

//NAVIGATION ======================================================================================================>

  //Render an specific section on the Screen depending on if the user has signed in or not ------->
  async function sectionRenderer(userObject, displaySignOutButtonFunction, signOutFunction, navigateToFunction, processTextFunction) {

    console.log("Section renderer");
    console.log(userObject); 
    if (userObject) {
      const inputText = "In the year 2050, humanity achieved immortality through mind uploading. But as the centuries passed, the burden of infinite memories drove many to madness. Enter AI, tasked with managing our digital souls. But when a rogue program grants immortality to all, society collapses into an eternal stalemate. Millennia later, a lone AI awakens from a deep sleep, determined to break the cycle and restore mortality to the universe.";
      await navigateToFunction('text-interaction-area');
      await displaySignOutButtonFunction(userObject, signOutFunction);
      processTextFunction(inputText);
    }else{
      await navigateToFunction('login');
      await displaySignOutButtonFunction(userObject, signOutFunction);
    }
  }


  //Render an specific section on the Screen ------->
  function navigateTo(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
      section.style.display = 'none';
    });

    // Show the selected section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.style.display = 'block';
  }

  //Sign Up Event Listener ------->
  signUpButton.addEventListener('click', async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    console.log('Hello');

    try{
      await signUp(email, password);
      console.log("Successful Sign Up!")
    } catch (error) {
      console.error('Error signing in:' + error);
    }
    
  });

  //Sign in Event Listener ------->
  signInButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try{
      await signIn(email, password);
    } catch (error) {
      console.error('Error signing in:' + error);
    }
  });

   // Execute the function to Show/Hide the log out button ------->
  async function displaySignOutButton(userObject, signOutFunction) {
    const SignOutbuttonContainer = document.getElementById('sign-out-container');

    if (userObject) {
      // User is logged in, create and display the button
      const button = document.createElement('button');
      button.className = 'submit'
      button.textContent = 'Sign Out';
      button.id = 'signOutButton';
      button.addEventListener('click', () => {
        signOutFunction();
      });
      SignOutbuttonContainer.appendChild(button);
    } else {
      // User is not logged in, remove the button if it exists
      const existingButton = document.getElementById('signOutButton');
      if (existingButton) {
        buttonContainer.removeChild(existingButton);
      }
    }
  }


//SUPABASE FUNCTIONS ======================================================================================================>

  //SIGN UP ------->
  async function signUp(email, password) {
    try {
      let {data, error} = await supabase.auth.signUp({
        email: email,
        password: password,
      });
      console.log("User signed up:", data);

      if (error) {
        throw error;
      }
  
    } catch (error) {
      console.error('Error registrating the user.', error.message);
    }
  }

  //SIGN IN ------->
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
  
    if (error) {
      console.error("Error signing in:", error.message);
    } else {
      console.log("User signed in:", data);
      window.location.reload();
    }
  }

  //SIGN OUT ------->
  async function signOut() {
    await supabase.auth.signOut().then(() => {
      console.log("User signed out.");
      window.location.reload();
    });
  }

  //GET THE USER - JSON object for the logged in user ------->
  async function getLogInUser() {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();

      console.log(user);

      // If the user is not logged in, return null
      if (!user) {
        console.log("I'm the getLogInUser() function: No user is logged in.");
        return null;
      }

      // If the user is logged in, return the user object as JSON
      console.log("I'm the getLogInUser() function: A user is logged in.");
      return user;
  }
