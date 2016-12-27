package main

import (
	"bytes"
	"crypto/rand"
	"encoding/gob"
	"encoding/json"
	"fmt"
	"github.com/gorilla/context"
	"github.com/gorilla/sessions"
	"io/ioutil"
	"log"
	"math/big"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strconv"
	"strings"
)

type TokenBundle struct {
	TokenType    string `json:"token_type"`
	Token        string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

func OAuthEcho(token string) error {
	return nil
}

const description = `
- Directories/Files
  - static/
    - serve static files without authentication.
  - pages/
    - serve html files with authentication.
- Commands
  - init
    - if not exist, create static directory, pages directory, and config.json file.
  - server
    - start serving.
`

func random(length int) string {
	const base = 36
	size := big.NewInt(base)
	n := make([]byte, length)
	for i, _ := range n {
		c, _ := rand.Int(rand.Reader, size)
		n[i] = strconv.FormatInt(c.Int64(), base)[0]
	}
	return string(n)
}

func scanPages(root string) *map[string]string {
	apiPaths := map[string]string{}
	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if ext := filepath.Ext(path); ext == ".html" {
			relPath, _ := filepath.Rel(root, filepath.Dir(path))
			var apiPath string
			if basename := strings.TrimSuffix(filepath.Base(path), ext); basename == "index" {
				apiPath = relPath
			} else {
				relPath, _ = filepath.Rel(root, filepath.Dir(path))
				apiPath = relPath + "/" + basename
			}
			apiPath = strings.TrimLeft(apiPath, "./")
			apiPath = "/" + apiPath
			apiPaths[apiPath] = path
		}
		return nil
	})
	return &apiPaths
}

func Init() {
	if err := os.Mkdir("./pages", 0777); err == nil {
		fmt.Println(`"pages" directory is created.`)
	}
	if err := os.Mkdir("./static", 0777); err == nil {
		fmt.Println(`"static" directory is created.`)
	}
	if err := os.Mkdir("./static", 0777); err == nil {
		fmt.Println(`"static" directory is created.`)
	}
	if _, err := os.Stat("./config.json"); err != nil {
		f, _ := os.Create("./config.json")
		defer f.Close()
		data := map[string]interface{}{
			"port":            "8081",
			"session_name":    random(8),
			"client_id":       "",
			"oauth_state":     "dummy",
			"client_secret":     "something_very_secret",
			"authz_endpoint":  "http://localhost:8080/oauth2/authorize",
			"token_endpoint":  "http://localhost:8080/oauth2/token",
			"logout_endpoint": "http://localhost:8080/logout",
			"redirect_url":    "http://localhost:8081/oauth2/callback",
			"approval":        false,
			"statics":	"[\"/static/\"]",
		}
		jsonString, _ := json.MarshalIndent(data, "", "\t")
		f.Write(jsonString)
		fmt.Println(`"config.json" file is created.`)
	}

	fmt.Println(description)
}

func Server() {
	var err error
	var config map[string]interface{}
	data, err := ioutil.ReadFile("config.json")

	if err != nil {
		fmt.Println("Error")
		return
	}
	err = json.Unmarshal(data, &config)
	fmt.Println(config);

	port, _ := config["port"].(string)
	sessionName, _ := config["session_name"].(string)
	clientId, _ := config["client_id"].(string)
	clientSecret, _ := config["client_secret"].(string)
	oauthState, _ := config["oauth_state"].(string)
	authzEndpoint, _ := config["authz_endpoint"].(string)
	tokenEndpoint, _ := config["token_endpoint"].(string)
	logoutEndpoint, _ := config["logout_endpoint"].(string)
	redirectUrl, _ := config["redirect_url"].(string)
	approval, _ := config["approval"].(bool)
	staticsJson, _ := config["statics"]
	headersJson, _ := config["headers"]

	statics := staticsJson.([]interface{})
	headers,headerok := headersJson.([]interface{})

	gob.Register(&TokenBundle{})
	store := sessions.NewCookieStore([]byte("something-very-secret"))

	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Cache-control", "no-cache")
		w.Header().Set("Expires", "0")
		logoutUrl := logoutEndpoint

		switch r.Method {
		case "GET":
			fmt.Println("GET -> /logout")
			session, _ := store.Get(r, sessionName)
			delete(session.Values, "token_bundle")
			session.Save(r, w)
			context.Clear(r)
			http.Redirect(w, r, logoutUrl, 302)
		default:
			fmt.Println(r.Method + " /oauth2/callback -> 404 NOT_FOUND")
			w.WriteHeader(404)
		}
	})
	fmt.Println("GET " + ":" + port + "/logout")

	// OAuth2.0 Callback
	http.HandleFunc("/oauth2/callback", func(w http.ResponseWriter, r *http.Request) {

		fmt.Println("mark 1 ---------------------------------------------------")

		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Cache-control", "no-cache")
		w.Header().Set("Expires", "0")
		switch r.Method {
		case "GET":
			fmt.Println("GET -> /oauth2/callback")

			values := r.URL.Query()
			authorizationCode := values.Get("code")

			data := url.Values{}
			data.Add("grant_type", "authorization_code")
			data.Add("code", authorizationCode)
			data.Add("redirect_uri", redirectUrl)
			data.Add("client_secret", clientSecret)
			fmt.Println(data)
			fmt.Println("or something ")
			req, _ := http.NewRequest("POST", tokenEndpoint, bytes.NewBufferString(data.Encode()))
			req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
			client := &http.Client{}
			resp, _ := client.Do(req)
			if resp == nil{
				fmt.Println("mark 2 ----------------------------")
			}
			fmt.Println("mark 3 ----------------------------")
			fmt.Println(resp)

			if resp.StatusCode == http.StatusOK {
				defer resp.Body.Close()
				session, _ := store.Get(r, sessionName)
				body, _ := ioutil.ReadAll(resp.Body)
				var tokenBundle TokenBundle
				if err = json.Unmarshal(body, &tokenBundle); err == nil {
					session.Values["token_bundle"] = tokenBundle
					session.Save(r, w)
					fmt.Printf("[SESSION]: %s\n", session.Values["token_bundle"])
					comebackUrl, ok := session.Values["comeback_url"].(string)
					if ok {
						delete(session.Values, "comeback_url")
						session.Save(r, w)
						http.Redirect(w, r, comebackUrl, 302)
						return
					} else {
						fmt.Fprintf(w, "Authentication and authorization successfully")
					}
				}
			}
			fmt.Fprintf(w, "OAuth2.0 Failure")
		default:
			fmt.Println(r.Method + " /oauth2/callback -> 404 NOT_FOUND")
			w.WriteHeader(404)
		}
	})
	fmt.Println("GET " + ":" + port + "/oauth2/callback")

	http.HandleFunc("/oauth2/token", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Cache-control", "no-cache")
		w.Header().Set("Expires", "0")
		switch r.Method {
		case "GET":
			session, _ := store.Get(r, sessionName)
			tokenBundle, ok := session.Values["token_bundle"].(*TokenBundle)
			if ok && OAuthEcho(tokenBundle.Token) == nil {
				fmt.Println("GET /oauth2/token -> 200")
				fmt.Fprintf(w, tokenBundle.Token)
			} else {
				fmt.Println("GET /oauth2/token -> 404 NOT_FOUND(Unauthorized)")
				w.WriteHeader(404)
			}
		default:
			fmt.Println(r.Method + " /oauth2/token -> 404 NOT_FOUND")
			w.WriteHeader(404)
		}
	})



	fmt.Println("GET " + ":" + port + "/oauth2/token")

	// Statics (HTML/CSS/JS/Images)
	for _,static := range statics {
		static_path_string,_ := static.(string)
		//http.Handle(static_path_string, http.StripPrefix(static_path_string, http.FileServer(http.Dir("./"+static_path_string))))
		http.HandleFunc(static_path_string, func(w http.ResponseWriter, r *http.Request) {
			fmt.Println(headerok)
			fmt.Println("mark 1 -------------");

			if headerok {
				fmt.Println("mark 2 -------------");

				for _, header := range headers {
					fmt.Println(header)
					headerMap := header.(map[string]interface{})
					for key,value := range headerMap {
						w.Header().Set(key, value.(string))
					}
				}

			}
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Cache-control", "no-cache")
			w.Header().Set("Expires", "0")

			fmt.Println("GET " + r.URL.String())
			http.ServeFile(w, r, "./"+r.URL.String())
		})
		fmt.Println("GET " + ":" + port + static_path_string  +"/* -> static files in 'static' directory without authentication")

	}

	// Pages
	queryParams := ""
	queryParams += "response_type=code"
	queryParams += "&client_id=" + url.QueryEscape(clientId)
	queryParams += "&state=" + url.QueryEscape(oauthState)
	queryParams += "&redirect_uri=" + url.QueryEscape(redirectUrl)
	queryParams += "&approval=" + strconv.FormatBool(approval)
	authzUri := authzEndpoint + "?" + queryParams

	root := "./pages"
	paths := scanPages(root)
	for apiPath, fp := range *paths {
		http.HandleFunc(apiPath, func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Pragma", "no-cache")
			w.Header().Set("Cache-control", "no-cache")
			w.Header().Set("Expires", "0")


			switch r.Method {
			case "GET":
				session, _ := store.Get(r, sessionName)
				tokenBundle, ok := session.Values["token_bundle"].(*TokenBundle)
				if ok && OAuthEcho(tokenBundle.Token) == nil {
					fmt.Println("GET " + r.URL.String() + " -> " + (*paths)["/"])
					http.ServeFile(w, r, (*paths)["/"])
					return
				}

				fmt.Println("Redirect " + r.URL.String() + " -> " + authzEndpoint)

				var comebackUrl string
				if r.URL.RawQuery != "" {
					comebackUrl = r.URL.Path + "?" + r.URL.RawQuery
				} else {
					comebackUrl = r.URL.Path
				}
				session.Values["comeback_url"] = comebackUrl
				session.Save(r, w)
				http.Redirect(w, r, authzUri, 302)
			default:
				fmt.Println(r.Method + " " + r.URL.String() + " -> 404 NOT_FOUND")
				w.WriteHeader(404)
			}
		})
		fmt.Println("GET " + ":" + port + apiPath + " -> " + fp + " with authentication")
	}



	// Start Server
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func main() {
	if len(os.Args) >= 2 {
		arg1 := os.Args[1]
		switch arg1 {
		case "init":
			Init()
		case "server":
			Server()
		default:
			fmt.Println("invalid subcommand.")
		}
	} else {
		fmt.Println("subcommand is none.")
	}
}
