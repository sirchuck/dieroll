package main

import(
	"fmt"
	"net/http"
	"strconv"
	"encoding/json"
	"strings"
	"io/ioutil"
	"os"
)

func pull_passvars(r *http.Request, passvars *Hreqs ){
	_ = json.NewDecoder(r.Body).Decode(&passvars)
}

func update_user(w http.ResponseWriter, r *http.Request, u *Users, passvars *Hreqs){
   	if( u.Status >= 1000 && iExist("private/users/" + strings.ToLower(alphNumStringNS(passvars.VALS["usr"])) + ".usr") ){
	   	if( passvars.VALS["s"] == "a0" ){
	   		// Delete only user file - allows user to log back in with new password and keep their characters and stuff
	   		_ = os.Remove("private/users/" + strings.ToLower(alphNumStringNS(passvars.VALS["usr"])) + ".usr") 
	   	}
	   	if( passvars.VALS["s"] == "d1" ){
	   		_ = os.Remove("private/users/" + strings.ToLower(alphNumStringNS(passvars.VALS["usr"])) + ".usr") 
	   		// Delete all champs
	   		// Delete all Stuffs
	   	}
	   	setperm := -1
	   	if( passvars.VALS["s"] == "d2" ){
	   		setperm = 2 // Banned
	   	}
	   	if( passvars.VALS["s"] == "a1" ){
	   		setperm = 0 // No Permissions
	   	}
	   	if( passvars.VALS["s"] == "a2" ){
	   		setperm = 10 // This is a user
	   	}
	   	if( passvars.VALS["s"] == "a3" ){
	   		setperm = 20 // This is a Helper
	   	}
	   	if( passvars.VALS["s"] == "a4" ){
	   		setperm = 1000 // This is a DM 
	   	}
	   	if( setperm > -1 ){
	   		t := Users{}
			userfile := fileToString( "private/users/" + strings.ToLower(alphNumStringNS(passvars.VALS["usr"])) + ".usr" )
			json.Unmarshal([]byte(userfile) , &t)
			t.Status = setperm
			b, err := json.Marshal(t)
				if err != nil {
			        fmt.Println(err)
			        return
			    }
			iWriteFileByte( "private/users/" + strings.ToLower(alphNumStringNS(passvars.VALS["usr"])) + ".usr", b )
	   	}
   	}
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"success\":\"true\"}")
}

func pull_user_list(w http.ResponseWriter, r *http.Request, u *Users){
	sa := "["
	entries, _ := os.ReadDir("private/users/")
	for _, e := range entries {
		if( e.Name()[len(e.Name())-4:] == ".usr" ){
			tuser       := Users{}
			userfile := fileToString( "private/users/" + e.Name() )
			json.Unmarshal([]byte(userfile) , &tuser)
			if(sa != "["){ sa +="," }
			sa += "[\"" + tuser.Username + "\",\"" + strconv.Itoa(tuser.Status) + "\"]"
		}
	}
	sa += "]"
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"cx\":\""+ u.Crosssite +"\", \"un\":\""+u.Username+"\", \"us\":"+strconv.Itoa(u.Status)+", \"sa\":"+sa+", \"success\":\"true\"}")
}

func check_login(w http.ResponseWriter, tcookie *SCookie, isLoggedIn *string, u *Users, passvars *Hreqs, controller string){
	*u = Users{}
	*isLoggedIn  = "0"
	Cookiepass  := "" 
	tuser       := Users{}
	if( iExist("private/users/" + strings.ToLower(tcookie.UN) + ".usr" ) ){
		userfile := fileToString( "private/users/" + strings.ToLower(tcookie.UN) + ".usr" )
		json.Unmarshal([]byte(userfile) , &tuser)

		ajax_allowed := true
		if( controller == "ajax" && tuser.Crosssite != passvars.VALS["cx"] ){
			ajax_allowed = false
		}

		if(ajax_allowed && tcookie.UN == tuser.Username && tcookie.UNQ == tuser.Cookiepass && tuser.Cookiepass != "" ){
			tuser.Cookiepass =  randomstring( 250, "lettersPlus" )
			tuser.Crosssite  =  randomstring( 250, "lettersPlus" )
			Cookiepass       = tuser.Cookiepass
			b, err := json.Marshal(tuser)
				if err != nil {
			        fmt.Println(err)
			        return
			    }
			iWriteFileByte( "private/users/" + strings.ToLower(tuser.Username) + ".usr", b )
			*u = tuser
			SetCookie(w, "dieroll", `{"u":"`+tuser.Username+`","q":"`+Cookiepass+`","v":"1","c":"0","s":0}`, "/", 0)
			*isLoggedIn = "1"
			// fmt.Println("Login Check Good!")
		}
	}
}


func do_logout(w http.ResponseWriter, u *Users){
	if( iExist("private/users/" + strings.ToLower(u.Username) + ".usr" ) ){
		b, _ := json.Marshal(u)
		iWriteFileByte( "private/users/" + strings.ToLower(u.Username) + ".usr", b )
	}
	SetCookie( w, "dieroll", "", "/", -1)
	fmt.Fprintf(w, "%s", "{\"err\":\"\", \"success\":\"true\"}")
}
func do_login(w http.ResponseWriter, r *http.Request, passvars *Hreqs){ 
			t   := Users{}
			t.Username = strings.ToLower(passvars.VALS["un"])
			t.Password = passvars.VALS["pw"]

			// err := json.NewDecoder(r.Body).Decode(&t)
		    // if err != nil {
		    if( t.Username == "" || t.Password == "" ){
				// fmt.Fprintf(w, "%s", "{\"err\":\"Error trying to collect user login information.\"}")
				fmt.Fprintf(w, "%s", "{\"err\":\"Username and or Password missing.\"}")
		    }else{
   				t.Username = strings.ToLower(alphNumStringNS( t.Username ))
				t.Password = alphNumString( t.Password )
				e := false;

				if( len(t.Username) > 15 ){
					fmt.Fprintf(w, "%s", "{\"err\":\"Username too large\"}")
					e = true;
				}

				if( len(t.Username) < 1 ){
					fmt.Fprintf(w, "%s", "{\"err\":\"Username too short\"}")
					e = true;
				}

				if( len(t.Password) < 1 ){
					fmt.Fprintf(w, "%s", "{\"err\":\"Password too short\"}")
					e = true;
				}
				if( len(t.Password) > 250 ){
					fmt.Fprintf(w, "%s", "{\"err\":\"Password too long\"}")
					e = true;
				}


				if( !e ){
					// write to file, check against memory device for cookie/crossite
					isLoggedIn  := false
					tuser       := Users{}
					Crosssite   := ""
					Cookiepass  := "" 

					if( iExist("private/users/" + strings.ToLower(t.Username) + ".usr" ) ){
						// Has Account - Check if login correct
						userfile := fileToString( "private/users/" + strings.ToLower(t.Username) + ".usr" )
						json.Unmarshal([]byte(userfile) , &tuser)
						if( t.Username == tuser.Username && bCryptCheck(tuser.Password, t.Password) ){
							// If Cookie doesn't match then clear cookie and make them relog in
							// We don't care if cookie matches we're going to set a cookie on successful login
							// if (tuser.Cookiepass == Cookie.UNQ ){ fmt.Println("User Cookie Matched!") } else {fmt.Println("User Cookie Failed!")}
							// Check Crosssite or not logged in? - you are here.
							// if (tuser.Crosssite  == "the passed crossite" ){ fmt.Println("CrossSite Matched!") } else {fmt.Println("Crossight Failed!")}
							tuser.Crosssite  = randomstring( 250, "lettersPlus" )
							Crosssite = tuser.Crosssite
							tuser.Cookiepass =  randomstring( 250, "lettersPlus" )
							Cookiepass   = tuser.Cookiepass

							b, err := json.Marshal(tuser)
	    						if err != nil {
							        fmt.Println(err)
							        return
							    }
							iWriteFileByte( "private/users/" + strings.ToLower(tuser.Username) + ".usr", b )

							isLoggedIn = true
							fmt.Println("User logged in.")
						}
					} else {
						// Doesn't have an account, so create one
						t.Password   = bCrypt( t.Password )
						t.Status     = 0
						t.Crosssite  = randomstring( 250, "lettersPlus" )
						Crosssite    = t.Crosssite
						t.Cookiepass =  randomstring( 250, "lettersPlus" )
						Cookiepass   = t.Cookiepass


						files,_ := ioutil.ReadDir("private/users/")
    					fmt.Println(len(files))
						if( len(files) == 0 ){
							t.Status = 1000
						}

						b, err := json.Marshal(t)
    						if err != nil {
						        fmt.Println(err)
						        return
						    }
						iWriteFileByte( "private/users/" + strings.ToLower(t.Username) + ".usr", b )
						isLoggedIn = true
						tuser = t
						fmt.Println("User Created")
					}

					if( isLoggedIn ){

//						for i := len(users)-1; i >= 0; i-- {
//							if users[i].Username == tuser.Username {
//								users = append(users[:i], users[i+1:]...)
//							} 
//						}
//						users = append(users, tuser)

						SetCookie(w, "dieroll", `{"u":"`+tuser.Username+`","q":"`+Cookiepass+`","v":"1","c":"0","s":0}`, "/", 0)
						fmt.Fprintf(w, "%s", "{\"err\":\"\", \"success\":\"true\", \"cx\":\""+Crosssite+"\"}")
					} else {
						fmt.Fprintf(w, "%s", "{\"err\":\"\", \"success\":\"false\"}")
					}

			    }

			}

}



