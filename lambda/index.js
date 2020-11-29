const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const sprintf = require('i18next-sprintf-postprocessor');
const imagen ="https://adivina-numero.s3-eu-west-1.amazonaws.com/sorteo512.png";

var numSort, numInf, numSup;

const languageString = {
  es: {
    translation: {
            SKILL_NAME: 'ELIJO MI SUERTE',
            INSTRUCTIONS:'Se sortean tantos números como quieras entre un limite inferior y un límite superior.',
            WELCOME: 'Hola vamos a sortear uno, o más números entre los números que tu elijas. ¿Cual será el número mayor?. ',
            WHAT_DO_YOU_WANT:'Quieres que te repita tu apuesta?. ',
            LETS_GO_ARROUND:'Vamos a sortear ',
            NUMBERS_FROM:'números desde ',
            UNTIL_THE: 'hasta el ',
            THE_WINNING_NUMBERS:` Los números premiados son : `,
            HELP_MESSAGE: 'Para elegir tu suerte dime cuantos números necesitas y en que rango número mayor y número menor nos vamos a manejar. Para empezar ¿Cual será el número mayor?',
            HELP_REPROMPT: 'Puedes decir, quiero un sorteo o si quieres salir di cancela. Como te puedo ayudar?',
            FALLBACK_MESSAGE: 'Perdona no entendí bien, puedes repetir?',
            FALLBACK_REPROMPT: 'Perdona no entendí bien,cómo te puedo ayudar?',
            ERROR_MESSAGE: 'Lo sentimos, se ha producido un error.',
            STOP_MESSAGE: 'Hasta pronto amigo!. ',
            DESEA_SUERTE:
                [
                'Te deseo suerte con esta apuesta. ',
                'Una combinación ganadora, seguro!. ',
                'Seguro que te daré suerte. ',
                ],
	  
    },
  },
  
   'en-US': {
    translation: {
     
            SKILL_NAME: 'I CHOOSE MY LUCK',
            INSTRUCTIONS:'As many numbers as you want are drawn between a lower limit and an upper limit.',
            WELCOME: 'Hello, we will sort one, or more numbers between the numbers you choose. What will be the largest number? ',
            WHAT_DO_YOU_WANT:'Do you want me to repeat your bet?. ',
            LETS_GO_ARROUND:"Let's go around",
            NUMBERS_FROM:'numbers from ',
            UNTIL_THE: 'until the ',
            THE_WINNING_NUMBERS:'The winning numbers are: ',
            HELP_MESSAGE: 'To choose your luck, tell me how many numbers you need and in what rank are the major and minor numbers going to be handled. To start, tell me What will be the largest number?',
            HELP_REPROMPT: 'You can say, I want a raffle or if you want to leave say cancel. How can I help you?',
            FALLBACK_MESSAGE: 'Sorry I did not understand well, can you repeat?',
            FALLBACK_REPROMPT: 'Sorry I did not understand well, how can I help you?',
            ERROR_MESSAGE: 'Sorry, an error occurred.',
            STOP_MESSAGE: 'See you soon! my friend. ',
            DESEA_SUERTE:
            [
                'I wish you luck with this bet. ',
                'A winning combination, for sure!. ',
                'Surely I will give you luck. ',
                
            ],
      
    },
  },
    
};



function sorteo (nRep,nInf,nSup){
    const Rep = parseInt(nRep,10);
    const inf = parseInt(nInf,10);
    const sup = parseInt(nSup,10);
    var sorteo = new Array();
    
    for (let a = 0; a < Rep; a++){
        const numAle = Math.floor(Math.random() * (inf - sup)) + sup;  
        sorteo.push(numAle)
    }
    console.log('estoy DENTRO DE SORTEO' + sorteo)
    return sorteo;
}
    


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const requestAttributes =handlerInput.attributesManager.getRequestAttributes();
        console.log('DENTRO DE: LaunchRequest');
        
        const speakOutput = requestAttributes.t('WELCOME');
        const textCard = requestAttributes.t('INSTRUCTIONS');
        const skillName = requestAttributes.t('SKILL_NAME');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .withStandardCard(skillName,textCard,imagen)
            .getResponse();
    }
};
// *******************************************************************************************
//************************     EMPEZAMOS A DELEGAR EL DIÁLOGO    ******************************
// *******************************************************************************************
const InProgressSorteoNumeroIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' &&
      request.intent.name === 'SorteoNumeroIntent' &&
      request.dialogState !== 'COMPLETED';
  },
  
  // MIENTRAS NO ESTÉ COMPLETO, DELEGA EL DIÁLOGO
  handle(handlerInput) {
    const currentIntent = handlerInput.requestEnvelope.request.intent;
    return handlerInput.responseBuilder
      .addDelegateDirective(currentIntent)
      .getResponse();
  },
};

const CompletedSorteoNumeroIntent = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest' && request.intent.name === 'SorteoNumeroIntent';
  },
  handle(handlerInput) {
    const requestAttributes =handlerInput.attributesManager.getRequestAttributes();
    console.log('SorteoNumeroIntent - handle');

    const responseBuilder = handlerInput.responseBuilder;
    const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
    const slotValues = getSlotValues(filledSlots);

    // compose speechOutput that simply reads all the collected slot values
    let speechOutput1 = getRandomPhrase(requestAttributes.t('DESEA_SUERTE'));

    // activity is optional so we'll add it to the output
    // only when we have a valid activity
    if (slotValues.travelMode) {
      speechOutput1 += slotValues.travelMode;
    } else {
      speechOutput1 += requestAttributes.t('LETS_GO_ARROUND');
    }
    const numDesde = requestAttributes.t('NUMBERS_FROM');
    const hastaNum = requestAttributes.t('UNTIL_THE');

    // Now let's recap the trip THE_WINNING_NUMBERS
    speechOutput1 = `${speechOutput1}  ${slotValues.cantNum.synonym} ${numDesde}  ${slotValues.numInf.synonym} ${hastaNum}  ${slotValues.numSup.synonym} . `;

    const intent = handlerInput.requestEnvelope.request.intent;
    var numSup = intent.slots.numSup.value;
    var numInf = intent.slots.numInf.value;
    var numSort = intent.slots.cantNum.value;

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        
        console.log('vamos a sortear '+ numSort+' números, entre los números '+ numInf+' y '+ numSup);
        
        const premio = sorteo(numSort,numInf,numSup);
        console.log('PREMIO = '+ premio)
        const textOutput = (premio.toString()).replace(/,/g,'<break time="1s"/> :  ');
        const textCard = (premio.toString()).replace(/,/g,' , ');
        const textOutputAPL = (premio.toString()).replace(/,/g,' , ');
        
        const speakOutput = speechOutput1 + requestAttributes.t('THE_WINNING_NUMBERS')+textOutput +'. '+ requestAttributes.t('WHAT_DO_YOU_WANT');
        const speakOutputReprompt = requestAttributes.t('WHAT_DO_YOU_WANT');
        const textOutputCard = speechOutput1 + requestAttributes.t('THE_WINNING_NUMBERS')+textCard+'. '+ requestAttributes.t('WHAT_DO_YOU_WANT') ;
        const skillName = requestAttributes.t('SKILL_NAME');
        const speakRepeat = requestAttributes.t('THE_WINNING_NUMBERS')+textOutput
        console.log('textOutput = '+ textOutput)
        
        Object.assign(sessionAttributes,{premio,skillName,speakRepeat,speakOutput,speakOutputReprompt,textOutputCard,textOutputAPL,textOutput,numSup,numInf,numSort});
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        
        
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutputReprompt)
            .withStandardCard(skillName,textOutputCard,imagen)
            //.withShouldEndSession(true)
            .getResponse();
  },
};

// 2. CONTROL DE LLENADO DE SLOTS

function getSlotValues(filledSlots) {
  const slotValues = {};

  console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
  Object.keys(filledSlots).forEach((item) => {
    const name = filledSlots[item].name;

    if (filledSlots[item] &&
      filledSlots[item].resolutions &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
      filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
      switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
        case 'ER_SUCCESS_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
            isValidated: true,
          };
          break;
        case 'ER_SUCCESS_NO_MATCH':
          slotValues[name] = {
            synonym: filledSlots[item].value,
            resolved: filledSlots[item].value,
            isValidated: false,
          };
          break;
        default:
          break;
      }
    } else {
      slotValues[name] = {
        synonym: filledSlots[item].value,
        resolved: filledSlots[item].value,
        isValidated: false,
      };
    }
  }, this);

  return slotValues;
}

// *************************************************************************************************
//********************   FIN DE LA DELEGACIÓN DE DIÁLOGO   ******************************************
// *************************************************************************************************

function getRandomPhrase(array) {
  // the argument is an array [] of words or phrases
  const i = Math.floor(Math.random() * array.length);
  return (array[i]);
}



const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
        const speakOutput = requestAttributes.t('HELP_MESSAGE');
        const speakOutputReprompt = requestAttributes.t('HELP_REPROMPT');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutputReprompt)
            .getResponse();
    }
};


//**********************************************************************************************************************************************
//**********************************************************************************************************************************************


//**********************************************************************************************************************************************
//********************************     AL DECIR PUEDES REPETIR SE CARGAN LOS U´LTIMOS AUDIOS Y TEXTOS ******************************************
const RepeatIntent = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
        && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.RepeatIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent');
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
        
        var speakOutput = sessionAttributes.speakRepeat;
        var speakOutputReprompt = sessionAttributes.speakOutputReprompt;
        var textOutputCard = sessionAttributes.textOutputCard;
        var textOutputAPL = sessionAttributes.textOutputAPL;
        var skillName = sessionAttributes.skillName;
    
    if (supportsAPL(handlerInput)) { 
        
        speakOutput = sessionAttributes.speakRepeat;
        speakOutputReprompt = sessionAttributes.speakOutputReprompt;
        textOutputCard = sessionAttributes.textOutputCard;
        textOutputAPL = sessionAttributes.textOutputAPL;
        skillName = sessionAttributes.skillName;
        
        Object.assign(sessionAttributes,{speakOutput,speakOutputReprompt,textOutputCard,textOutputAPL});
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            
    	  return handlerInput.responseBuilder
    		.speak(speakOutput+'. '+requestAttributes.t('WHAT_DO_YOU_WANT'))
    		.reprompt(speakOutputReprompt)
    		//.withStandardCard(tituloGameName,textOutput,imagen)
    		.addDirective({
    			type: 'Alexa.Presentation.APL.RenderDocument',
    			version: '1.0',
    				document: require('./palabrasAPL.json'),
    			datasources: {
    				"docdata": {
    					"titulo": skillName,
    					"palabras": textOutputAPL
    				}
    			}
    		})
    		//.withShouldEndSession(true)
    		.getResponse();
  }
        speakOutput = sessionAttributes.speakRepeat;
        speakOutputReprompt = sessionAttributes.speakOutputReprompt;
        textOutputCard = sessionAttributes.textOutputCard;
        skillName = sessionAttributes.skillName;
        
        Object.assign(sessionAttributes,{speakOutput,speakOutputReprompt,textOutputCard});
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
  
    return handlerInput.responseBuilder
        .speak(speakOutput+'. '+requestAttributes.t('WHAT_DO_YOU_WANT'))
        .reprompt(speakOutputReprompt)
        .withStandardCard(skillName,textOutputCard,imagen)
        .getResponse();
  },
};


const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.NoIntent');
    },
    handle(handlerInput) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
        const speakOutput = requestAttributes.t('STOP_MESSAGE');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .withShouldEndSession(true)
            .getResponse();
    }
};
const FallbackHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      handlerInput.requestEnvelope.request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
    const speakOutput = requestAttributes.t('FALLBACK_MESSAGE');
    const speakOutputReprompt = requestAttributes.t('FALLBACK_REPROMPT');
    console.log('DENTRO DE: FallbackHandler');
   
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    
    Object.assign(sessionAttributes,{speakOutput,speakOutputReprompt});
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    
    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutputReprompt)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = requestAttributes.t('ERROR_MESSAGE');

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const LocalizationInterceptor = {
  process(handlerInput) {
    const localizationClient = i18n.use(sprintf).init({
      lng: handlerInput.requestEnvelope.request.locale,
      overloadTranslationOptionHandler: sprintf.overloadTranslationOptionHandler,
      resources: languageString,
      returnObjects: true
    });

    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function (...args) {
      return localizationClient.t(...args);
    };
  },
};
function supportsAPL(handlerInput) {
    const supportedInterfaces = handlerInput.requestEnvelope.context.System.device.supportedInterfaces;
    const aplInterface = supportedInterfaces['Alexa.Presentation.APL'];
    return aplInterface !== null && aplInterface !== undefined;
}

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        InProgressSorteoNumeroIntent,
        CompletedSorteoNumeroIntent,
        HelpIntentHandler,
        RepeatIntent,
        CancelAndStopIntentHandler,
        FallbackHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addRequestInterceptors(LocalizationInterceptor)
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('cookbook/dialog-delegate/v1')
    .lambda();
