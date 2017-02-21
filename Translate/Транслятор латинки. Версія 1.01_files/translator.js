// Транслітератор
//=================================================================
Translator = new Object();
Translator.version = "4.00";
Translator.copyleft;
Translator.url = "http://transliterator.uuuq.com/";
// Історія змін
// 4.00 Тестова версія.
//=================================================================

// RuleMap вертає функцію, що реалізує ефективне перетворення слова за заданими правилами.
// Правила задаються у вигляді масиву правил, кожне з яких складається з префіксних букв, замінюваної частини, результату і постфіксних букв.
// Префіксні букви при цьому можуть бути як відтрансльованими так і невідтрансльованими.
Translator.RuleMap = function(rules){
   // Вертає рядок str записаний буквами в регістрі відповідно до регістру букв рядка chars. Небукви іґноруються.
   // Букви в верхньому регістрі з str зберігаються такими незалежно від рядка chars.
   var ConvertStringCase = function (str,chars,addchars,defaultregister){
      if(!defaultregister) defaultregister=false;
      var chrs = new Array();
      var ssize = 0;
      for(var j=0; j<chars.length; ++j){
         var ch = chars.charAt(j);
	     if(ch.toLowerCase()==ch)
	        if(ch.toUpperCase()==ch);
		    else chrs[ssize++]=false;
	     else
	        chrs[ssize++]=true;
      }

      var FindFirstCharCase = function(seq){
         for(var j=0; j<seq.length; ++j){
            var ch = seq.charAt(j);
	        if(ch.toLowerCase()==ch)
	           if(ch.toUpperCase()==ch);
	           else return false;
	        else return true;
         }
         return defaultregister?(!chrs[0]?false:true):false;
      }
	  
      if(ssize<=1&&str.length>1) chrs[ssize++] = FindFirstCharCase(addchars);
   
      var result="";
      if(ssize<=str.length){
         for(var j=0; j<ssize; ++j)
	        result+=chrs[j]?str.charAt(j).toUpperCase():str.charAt(j);
	     if(ssize<str.length) result+=chrs[ssize-1]?str.substring(ssize,str.length).toUpperCase():str.substring(ssize,str.length);		 
      }else{
         var i=0;
	     var jssize=0;
         for(var j=0; j<str.length; ++j){
	        var chr = false;
		    jssize+=ssize;
	        while(jssize>=i*str.length) if(chrs[i++]) chr=true;
	        result+=chr?str.charAt(j).toUpperCase():str.charAt(j);
	     }
      }
      return result;
   }

   var map = new Object();
   for(var i=0; i<rules.length; ++i){
      var Rule = new Object();
      if(rules[i].length==2){
	     Rule.pre="";
		 Rule.post="";
		 Rule.pattern=rules[i][0];
		 Rule.res=rules[i][1];
	  }else
      if(rules[i].length==4){
	     Rule.pre=rules[i][0];
		 Rule.post=rules[i][3];
		 Rule.pattern=rules[i][1];
		 Rule.res=rules[i][2];
	  } else continue;
      var lettermap=Rule.pattern.charAt(0);
	  if(lettermap.length){
	     var mapelement=map[lettermap];
		 if(!mapelement)
		    mapelement=new Array();
		 mapelement[mapelement.length]=Rule;
		 map[lettermap]=mapelement;
	  }
   }
      
   var LastLetter = function(s,def){
      var i = s.length;
	  while(i--){
		 var r = s.charAt(i);
		 if(r!=r.toUpperCase()) return r;
	  }
	  return def;
   }
   var FirstLetter = function(s,def){
	  for(var i = 0; i<s.length; ++i){
		 var r = s.charAt(i);
		 if(r!=r.toUpperCase()) return r;
	  }
	  return def;
   }

   var translate = function(word){   
      var result = "";
      var lwr = word.toLowerCase()+" ";
      var lastchar = " ";
      var lastchart = " ";
	  var lastletter = " ";
	  var lastlettert = " ";
      while(word.length){
         var str = word.charAt(0);
	     var dec = str.length;
         var rules = map[lwr.charAt(0)];
         if(rules) 
   	        for(var i=0; i<rules.length; ++i){
	          if(rules[i].pre.length&&
		         (lastchar.length==0||lastchart.length==0||rules[i].pre.indexOf(lastchar)==-1&&rules[i].pre.indexOf(lastchart)==-1)) 
				    if(rules[i].pre.indexOf("@")==-1||rules[i].pre.indexOf(lastletter)==-1&&rules[i].pre.indexOf(lastlettert)==-1) continue;
		       var pattern = rules[i].pattern;
		       if(lwr.indexOf(pattern)==0){
			      if(rules[i].post.length){
				     var post = lwr.substring(pattern.length,lwr.length);
			         if(rules[i].post.indexOf(post.charAt(0))==-1&&(rules[i].post.indexOf("@")==-1||rules[i].post.indexOf(FirstLetter(post," "))==-1)) continue;
				  }
			      dec=pattern.length;
			      str=ConvertStringCase(rules[i].res,word.substring(0,dec),word.substring(dec,word.length-dec+1),result.length>0);
			      break;
		       }
	        }
	     lastchar=lwr.substring(dec-1,dec);
	     lastchart=str.substring(str.length-1,str.length).toLowerCase();

		 lastletter = LastLetter(lwr,lastletter)
		 lastlettert = LastLetter(str.toLowerCase(),lastlettert);
	  
	     word=word.substring(dec,word.length);
	     lwr=lwr.substring(dec,lwr.length);
         result+=str;
      }
      return result;
   }

   return translate;
}

// Вертає функцію, що перетворює текст, підставляючи всі слова у функцію Rule.
// Функція вважається чистою і кешується за допомогою мапи слів.
Translator.TranslateText = function(Rule){
   var IsExcluded = function(str){
      var i = OnChange.exclsymbols.length;
      while(i--) if(str.indexOf(OnChange.exclsymbols.charAt(i))!=-1) return true;
      return false;
   }

   var wordmap = new Object();
   
   var OnChange = function(src){
      var startDate = new Date();
	  
	  var firstsplit = src.split("\n");
      var newmap = new Object();

      OnChange.patches = 0;
      OnChange.cached = 0;	  

      for(var i=0; i<firstsplit.length; ++i){
	     var source = firstsplit[i].split(" ");
		 OnChange.patches+=source.length;
	  	 for(var s=0; s<source.length; ++s){
            var stext = source[s];
            var text = wordmap[stext];
            if(!text)
			   text=Rule(stext);
			else
			   OnChange.cached++;
            newmap[stext]=text;
            if(OnChange.dogcheck&&stext.charAt(0)=="@")
               text=stext.substring(1,stext.length);
            else
               if(OnChange.exclcheck&&IsExcluded(stext))
                  text=stext;
               else;
			source[s]=text;
         }
		 firstsplit[i]=source.join(" ");      
       }

	   wordmap = newmap;	  
	   var dst=firstsplit.join("\n");
       OnChange.worktime = ((new Date()).getTime() - startDate.getTime());
	   return dst;
   }
   
   OnChange.dogcheck = true;
   OnChange.exclcheck = true;
   
   OnChange.worktime = 0; // час роботи в мілісекундах
   OnChange.patches = 0;  // кількість оброблених слів
   OnChange.cached = 0;   // кількість кешованих слів

   OnChange.exclsymbols = "@/\\+=*";

   return OnChange;
}

Util = new Object();

Util.IsCharacter = function(ch){
   return ch.toUpperCase()!=ch.toLowerCase();
}

// Об'єднує спецсимволи з одного і того ж слова
Util.MergeSpecSym = function(word1, word2){
   var res = "";
   if(!word2 || !word1) return res;
   var c1 = 0;
   var c2 = 0;
   for(;;){
	  while(word1.charAt(c1)==word2.charAt(c2)){
		 res+=word1.charAt(c1);
	     ++c1;
		 ++c2;
	     if(c1>=word1.length) return res+word2.substr(c2,word2.length);
		 else 
		 if(c2>=word2.length) return res+word1.substr(c1,word1.length);
	  }
	  if(!Util.IsCharacter(word1.charAt(c1))){
		 res += word1.charAt(c1++);
		 if(c1>=word1.length) return res+word2.substr(c2,word2.length);
	  }else
	  if(!Util.IsCharacter(word2.charAt(c2))){
		 res += word2.charAt(c2++);
		if(c2>=word2.length) return res+word1.substr(c1,word1.length);
	  } else return res;
   }
}

// Вертає значення параметра, взяе з адресного рядка
Util.GetParam = function(name){
   var results = RegExp("[\\?&]"+name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]")+"=([^&#]*)").exec(window.location.href);
   return results == null?"":decodeURIComponent(results[1]);
}

Util.PutParam = function(name, value, tail){
   if(!tail)tail="";
   if(!value || !name || !value.length || !name.length) return tail;
   return "?"+name+"="+encodeURIComponent(value)+tail.replace("?","&");
}

// Визначає яку форму іменника вживати — однину, двоїну, троїну чи множину
Util.SelectSDTP = function(num, singular, dual, trial, plural){
   if(plural==null){ plural=trial; trial=dual; }
   if(plural==null) plural=trial;	
   if(plural==null) return singular;
   num=num%100;
   if(num<10||num>19) switch (num % 10){
      case 1: return singular;
	  case 2: return dual;
	  case 3: return trial;
	  case 4: return trial;
   }
   return plural;
}

{
   // CQ Counter code start
   var _d=document; var _n=navigator; var _t=new Date();
   var _c="0"; var _r="0"; var _j="U"; var _k="U";
   _d.cookie="_c=y"; _d.cookie.length>0?_k="Y":_k="N";
   _n.javaEnabled()?_j="Y":_j="N";
   var _b=screen; _r=_b.width; _n.appName!="Netscape"?_c=_b.colorDepth : _c=_b.pixelDepth;
   //_d.write("<img src=\"http://ua.2.cqcounter.com/cgi-bin/c?_id=translit&_z=0&_r="+_r+"&_c="+_c+"&_j="+_j+"&_t="+(_t.getTimezoneOffset())+"&_k="+_k+"&_l="+escape(_d.referrer)+"\" width=0 height=0 "+"border=0>");
   // CQ Counter code end
   Translator.counterImage = new Image;
   Translator.counterImage.src="http://ua.2.cqcounter.com/cgi-bin/c?_id=translit&_z=0&_r="+_r+"&_c="+_c+"&_j="+_j+"&_t="+(_t.getTimezoneOffset())+"&_k="+_k+"&_l="+escape(_d.referrer);
}
