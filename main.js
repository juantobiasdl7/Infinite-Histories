import { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = new SupabaseClient(supabaseUrl, supabaseAnonKey);


const inputText = "This is an example text. Click on any word to highlight it.";

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

async function toggleHighlight(event) {
    event.target.classList.toggle('highlighted');
    const word = event.target.textContent;
    const color = event.target.classList.contains('highlighted') ? 'yellow' : '#89CFF0';
    await saveWord(word, color);
}

function processText(text) {
    const textContainer = document.getElementById('textContainer');
    const words = text.split(' ');

    words.forEach((word, index) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'word';
        wordSpan.textContent = word;
        wordSpan.addEventListener('click', toggleHighlight);
        textContainer.appendChild(wordSpan);

        if (index < words.length - 1) {
            const spaceSpan = document.createElement('span');
            spaceSpan.textContent = ' ';
            textContainer.appendChild(spaceSpan);
        }

    });
}

processText(inputText);