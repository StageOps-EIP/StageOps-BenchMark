package main

import (
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name" binding:"required"`
	Email string `json:"email" binding:"required"`
}

type Event struct {
	ID       int    `json:"id"`
	Title    string `json:"title" binding:"required"`
	Date     string `json:"date" binding:"required"`
	Capacity int    `json:"capacity" binding:"required"`
	Booked   int    `json:"booked"`
}

type Response struct {
	Success bool        `json:"success"`
	Count   *int        `json:"count,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
}

var users = []User{
	{ID: 1, Name: "Alice", Email: "alice@theatre.com"},
	{ID: 2, Name: "Bob", Email: "bob@theatre.com"},
	{ID: 3, Name: "Charlie", Email: "charlie@theatre.com"},
}

var events = []Event{
	{ID: 1, Title: "Le Cid", Date: "2026-03-15", Capacity: 500, Booked: 342},
	{ID: 2, Title: "Hamlet", Date: "2026-04-20", Capacity: 800, Booked: 756},
	{ID: 3, Title: "Macbeth", Date: "2026-05-10", Capacity: 600, Booked: 423},
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	// Health endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, HealthResponse{
			Status:    "ok",
			Service:   "gin",
			Timestamp: time.Now().Format(time.RFC3339),
		})
	})

	// Users endpoints
	r.GET("/users", func(c *gin.Context) {
		count := len(users)
		c.JSON(http.StatusOK, Response{
			Success: true,
			Count:   &count,
			Data:    users,
		})
	})

	r.GET("/users/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, Response{
				Success: false,
				Error:   "Invalid user ID",
			})
			return
		}

		for _, user := range users {
			if user.ID == id {
				c.JSON(http.StatusOK, Response{
					Success: true,
					Data:    user,
				})
				return
			}
		}

		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Error:   "User not found",
		})
	})

	r.POST("/users", func(c *gin.Context) {
		var newUser User
		if err := c.ShouldBindJSON(&newUser); err != nil {
			c.JSON(http.StatusBadRequest, Response{
				Success: false,
				Error:   "Name and email required",
			})
			return
		}

		newUser.ID = len(users) + 1
		users = append(users, newUser)

		c.JSON(http.StatusCreated, Response{
			Success: true,
			Data:    newUser,
		})
	})

	// Events endpoints
	r.GET("/events", func(c *gin.Context) {
		count := len(events)
		c.JSON(http.StatusOK, Response{
			Success: true,
			Count:   &count,
			Data:    events,
		})
	})

	r.GET("/events/:id", func(c *gin.Context) {
		id, err := strconv.Atoi(c.Param("id"))
		if err != nil {
			c.JSON(http.StatusBadRequest, Response{
				Success: false,
				Error:   "Invalid event ID",
			})
			return
		}

		for _, event := range events {
			if event.ID == id {
				c.JSON(http.StatusOK, Response{
					Success: true,
					Data:    event,
				})
				return
			}
		}

		c.JSON(http.StatusNotFound, Response{
			Success: false,
			Error:   "Event not found",
		})
	})

	r.POST("/events", func(c *gin.Context) {
		var newEvent Event
		if err := c.ShouldBindJSON(&newEvent); err != nil {
			c.JSON(http.StatusBadRequest, Response{
				Success: false,
				Error:   "Title, date and capacity required",
			})
			return
		}

		newEvent.ID = len(events) + 1
		newEvent.Booked = 0
		events = append(events, newEvent)

		c.JSON(http.StatusCreated, Response{
			Success: true,
			Data:    newEvent,
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	r.Run(":" + port)
}
