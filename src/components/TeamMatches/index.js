import {Component} from 'react'
import {withRouter} from 'react-router-dom'
import Loader from 'react-loader-spinner'
import {PieChart, Pie, Cell, Legend} from 'recharts'

import LatestMatch from '../LatestMatch'
import MatchCard from '../MatchCard'

import './index.css'

class TeamMatches extends Component {
  state = {
    isLoading: true,
    recentMatchesData: {},
    count: 0, // Initialize count in state
  }

  componentDidMount() {
    this.getRecentMatches()
  }

  getFormattedObject = data => ({
    umpires: data.umpires,
    result: data.result,
    manOfTheMatch: data.man_of_the_match,
    id: data.id,
    date: data.date,
    venue: data.venue,
    competingTeam: data.competing_team,
    competingTeamLogo: data.competing_team_logo,
    firstInnings: data.first_innings,
    secondInnings: data.second_innings,
    matchStatus: data.match_status,
  })

  getRecentMatches = async () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    const response = await fetch(`https://apis.ccbp.in/ipl/${id}`)
    const fetchedData = await response.json()

    const formattedData = {
      teamBannerURL: fetchedData.team_banner_url,
      latestMatch: this.getFormattedObject(fetchedData.latest_match_details),
      recentMatches: fetchedData.recent_matches.map(recentMatch =>
        this.getFormattedObject(recentMatch),
      ),
    }

    // Set recent matches data and update the total match count in state
    this.setState({
      recentMatchesData: formattedData,
      isLoading: false,
      count: fetchedData.recent_matches.length, // Store the total count of recent matches
    })
  }

  getTeamClassName = () => {
    const {match} = this.props
    const {params} = match
    const {id} = params

    switch (id) {
      case 'RCB':
        return 'rcb'
      case 'KKR':
        return 'kkr'
      case 'KXP':
        return 'kxp'
      case 'CSK':
        return 'csk'
      case 'RR':
        return 'rr'
      case 'MI':
        return 'mi'
      case 'SH':
        return 'srh'
      case 'DC':
        return 'dc'
      default:
        return ''
    }
  }

  // Count Wins, Losses, Draws
  calculateMatchStats = () => {
    const {recentMatchesData} = this.state
    const {recentMatches} = recentMatchesData

    let won = 0
    let lost = 0
    let drawn = 0

    recentMatches.forEach(match => {
      if (match.matchStatus === 'Won') {
        won += 1
      } else if (match.matchStatus === 'Lost') {
        lost += 1
      } else {
        drawn += 1
      }
    })

    return [
      {name: 'Won', value: won, color: '#4caf50'},
      {name: 'Lost', value: lost, color: '#f44336'},
      {name: 'Drawn', value: drawn, color: '#ff9800'},
    ]
  }

  renderLoader = () => (
    <div testid="loader" className="loader-container">
      <Loader type="Oval" color="#ffffff" height="50" />
    </div>
  )

  renderTeamMatches = () => {
    const {recentMatchesData, count} = this.state
    const {teamBannerURL, recentMatches, latestMatch} = recentMatchesData
    const matchStats = this.calculateMatchStats()

    return (
      <div className="team-matches-container">
        <button
          className="back-button"
          type="button"
          onClick={() => this.props.history.push('/')}
        >
          Back
        </button>

        <img src={teamBannerURL} alt="team banner" className="team-banner" />
        <LatestMatch latestMatchData={latestMatch} />
        <ul className="recent-matches-list">
          {recentMatches.map(recentMatch => (
            <MatchCard matchData={recentMatch} key={recentMatch.id} />
          ))}
        </ul>

        {/* Display the total number of matches */}
        <h2>Total Matches Played: {count}</h2>

        {/* Pie Chart Section */}
        <div className="pie-chart-container">
          <h2 className="chart-heading">Match Statistics</h2>
          <PieChart width={300} height={300}>
            <Pie
              data={matchStats}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label
            >
              {matchStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </div>
      </div>
    )
  }

  render() {
    const {isLoading} = this.state
    const className = `team-matches-route-container ${this.getTeamClassName()}`

    return (
      <div className={className}>
        {isLoading ? this.renderLoader() : this.renderTeamMatches()}
      </div>
    )
  }
}

export default withRouter(TeamMatches)
